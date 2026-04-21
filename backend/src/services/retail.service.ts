import { Op } from 'sequelize';
import { Cart, Order, Product, Category, RetailCustomer, LoyaltyTransaction, Promotion, CartItem, CustomerAddress } from '../models/retail.models';
import { Instance, Ticket, Message } from '../models';
import logger from '../utils';

// ═══════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════

interface AddToCartInput {
  companyId: number;
  ticketId: number;
  phone: string;
  productId: number;
  quantity: number;
  notes?: string;
}

interface UpdateCartInput {
  companyId: number;
  cartId: number;
  action: 'add' | 'remove' | 'clear' | 'set_quantity';
  productId?: number;
  quantity?: number;
}

interface FinalizeCartInput {
  companyId: number;
  cartId: number;
  deliveryAddress: string;
  deliveryNotes?: string;
  paymentMethod: 'pix' | 'card' | 'cash';
  couponCode?: string;
}

interface ProductSearchInput {
  companyId: number;
  query: string;
  categoryId?: number;
  limit?: number;
}

interface LoyaltyConfig {
  pointsPerReal: number;
  tierThresholds: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  pointValue: number;
}

const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  pointsPerReal: 1,
  tierThresholds: { bronze: 0, silver: 100, gold: 500, platinum: 1000 },
  pointValue: 0.01,
};

// ═══════════════════════════════════════════════════════════════
// SERVIÇO DE VAREJO - MVP 2.0
// ═══════════════════════════════════════════════════════════════

class RetailService {
  // ─── CATÁLOGO ──────────────────────────────────────────────────

  async searchProducts(input: ProductSearchInput): Promise<Product[]> {
    const { companyId, query, categoryId, limit = 10 } = input;

    const whereClause: Record<string, unknown> = {
      company_id: companyId,
      is_active: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { sku: { [Op.iLike]: `%${query}%` } },
        { search_terms: { [Op.contains]: [query.toLowerCase()] } },
      ],
    };

    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // Verificar estoque
    const products = await Product.findAll({
      where: whereClause,
      limit,
      order: [['is_featured', 'DESC'], ['name', 'ASC']],
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });

    // Filtrar produtos com estoque
    return products.filter((p) => p.stock_unlimited || p.stock_quantity > 0);
  }

  async getCategories(companyId: number): Promise<Category[]> {
    return Category.findAll({
      where: { company_id: companyId, is_active: true },
      order: [['display_order', 'ASC'], ['name', 'ASC']],
      include: [{ model: Category, as: 'children' }],
    });
  }

  async getFeaturedProducts(companyId: number, limit = 5): Promise<Product[]> {
    return Product.findAll({
      where: {
        company_id: companyId,
        is_active: true,
        is_featured: true,
        [Op.or]: [{ stock_unlimited: true }, { stock_quantity: { [Op.gt]: 0 } }],
      },
      limit,
      order: [['name', 'ASC']],
    });
  }

  async getProductById(companyId: number, productId: number): Promise<Product | null> {
    return Product.findOne({
      where: { id: productId, company_id: companyId, is_active: true },
      include: [{ model: Category, as: 'category' }],
    });
  }

  // ─── CARRINHO ──────────────────────────────────────────────────

  async getOrCreateCart(companyId: number, phone: string, ticketId?: number): Promise<Cart> {
    let cart = await Cart.findOne({
      where: {
        company_id: companyId,
        contact_phone: phone,
        status: 'active',
      },
      order: [['created_at', 'DESC']],
    });

    if (!cart) {
      cart = await Cart.create({
        company_id: companyId,
        ticket_id: ticketId,
        contact_phone: phone,
        status: 'active',
        items: [],
        subtotal: 0,
        delivery_fee: 0,
        discount: 0,
        total: 0,
      });
    } else if (ticketId && cart.ticket_id !== ticketId) {
      await cart.update({ ticket_id: ticketId });
    }

    return cart;
  }

  async addToCart(input: AddToCartInput): Promise<Cart> {
    const { companyId, ticketId, phone, productId, quantity, notes } = input;

    const product = await this.getProductById(companyId, productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (!product.stock_unlimited && product.stock_quantity < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${product.stock_quantity}`);
    }

    const cart = await this.getOrCreateCart(companyId, phone, ticketId);
    const items = cart.items as CartItem[];

    const existingIndex = items.findIndex((item) => item.product_id === productId);
    const newItem: CartItem = {
      product_id: productId,
      product_name: product.name,
      quantity,
      unit_price: Number(product.price),
      total_price: Number(product.price) * quantity,
      notes,
    };

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
      items[existingIndex].total_price = items[existingIndex].quantity * items[existingIndex].unit_price;
    } else {
      items.push(newItem);
    }

    return this.recalculateCart(cart, items);
  }

  async removeFromCart(companyId: number, cartId: number, productId: number): Promise<Cart> {
    const cart = await Cart.findOne({ where: { id: cartId, company_id: companyId } });
    if (!cart) {
      throw new Error('Carrinho não encontrado');
    }

    const items = (cart.items as CartItem[]).filter((item) => item.product_id !== productId);
    return this.recalculateCart(cart, items);
  }

  async updateCartItemQuantity(
    companyId: number,
    cartId: number,
    productId: number,
    quantity: number
  ): Promise<Cart> {
    const cart = await Cart.findOne({ where: { id: cartId, company_id: companyId } });
    if (!cart) {
      throw new Error('Carrinho não encontrado');
    }

    const product = await this.getProductById(companyId, productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (!product.stock_unlimited && product.stock_quantity < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${product.stock_quantity}`);
    }

    const items = cart.items as CartItem[];
    const index = items.findIndex((item) => item.product_id === productId);

    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = quantity;
        items[index].total_price = quantity * items[index].unit_price;
      }
    }

    return this.recalculateCart(cart, items);
  }

  async clearCart(companyId: number, cartId: number): Promise<Cart> {
    const cart = await Cart.findOne({ where: { id: cartId, company_id: companyId } });
    if (!cart) {
      throw new Error('Carrinho não encontrado');
    }

    return this.recalculateCart(cart, []);
  }

  private async recalculateCart(cart: Cart, items: CartItem[]): Promise<Cart> {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryFee = await this.calculateDeliveryFee(cart.company_id, subtotal, cart.delivery_address);
    const discount = cart.discount || 0;

    await cart.update({
      items,
      subtotal,
      delivery_fee: deliveryFee,
      total: subtotal + deliveryFee - discount,
    });

    return cart;
  }

  private async calculateDeliveryFee(
    companyId: number,
    subtotal: number,
    _address: string | null
  ): Promise<number> {
    // Buscar configurações da empresa
    const instance = await Instance.findOne({ where: { company_id: companyId } });
    if (!instance) return 0;

    const metadata = (instance.settings || {}) as Record<string, unknown>;
    const deliveryFee = Number(metadata.delivery_fee || 0);
    const freeDeliveryMin = Number(metadata.free_delivery_min || 0);

    if (freeDeliveryMin > 0 && subtotal >= freeDeliveryMin) {
      return 0;
    }

    return deliveryFee;
  }

  // ─── PEDIDOS ──────────────────────────────────────────────────

  async finalizeCart(input: FinalizeCartInput): Promise<Order> {
    const { companyId, cartId, deliveryAddress, deliveryNotes, paymentMethod, couponCode } = input;

    const cart = await Cart.findOne({ where: { id: cartId, company_id: companyId, status: 'active' } });
    if (!cart) {
      throw new Error('Carrinho não encontrado ou já finalizado');
    }

    const items = cart.items as CartItem[];
    if (items.length === 0) {
      throw new Error('Carrinho vazio');
    }

    // Aplicar cupom se houver
    let discount = 0;
    if (couponCode) {
      discount = await this.applyCoupon(companyId, couponCode, cart.subtotal);
    }

    // Gerar número do pedido
    const orderNumber = await this.generateOrderNumber(companyId);

    // Criar pedido
    const order = await Order.create({
      company_id: companyId,
      ticket_id: cart.ticket_id,
      cart_id: cartId,
      order_number: orderNumber,
      status: 'pending',
      items,
      subtotal: cart.subtotal,
      delivery_fee: cart.delivery_fee,
      discount,
      total: cart.total - discount,
      delivery_address: deliveryAddress,
      delivery_notes: deliveryNotes,
      payment_method: paymentMethod,
      payment_status: 'pending',
    });

    // Marcar carrinho como convertido
    await cart.update({ status: 'converted' });

    // Atualizar estoque
    await this.updateStock(items);

    // Atualizar cliente
    await this.updateCustomerStats(companyId, cart.contact_phone, order.total);

    // Adicionar pontos de fidelidade
    await this.addLoyaltyPoints(companyId, cart.contact_phone, order.id, order.total);

    // Gerar pagamento se PIX
    if (paymentMethod === 'pix') {
      await this.generatePixPayment(order);
    }

    return order;
  }

  private async generateOrderNumber(companyId: number): Promise<string> {
    const today = new Date();
    const prefix = `PED${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

    const lastOrder = await Order.findOne({
      where: {
        company_id: companyId,
        order_number: { [Op.like]: `${prefix}%` },
      },
      order: [['created_at', 'DESC']],
    });

    let sequence = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.order_number.slice(-4), 10);
      sequence = lastNumber + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private async updateStock(items: CartItem[]): Promise<void> {
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (product && !product.stock_unlimited) {
        await product.update({
          stock_quantity: Math.max(0, product.stock_quantity - item.quantity),
        });
      }
    }
  }

  private async generatePixPayment(order: Order): Promise<void> {
    // Integração com gateway de pagamento (placeholder)
    // Em produção, usar Mercado Pago, Asaas, etc.
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${order.order_number}520400005303986540${order.total.toFixed(2)}5802BR5925LOJA VAREJO6009SAO PAULO62070503***6304`;

    await order.update({
      payment_qr_code: pixCode,
      payment_link: `https://pix.example.com/${order.order_number}`,
      payment_expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    });
  }

  // ─── CLIENTES ──────────────────────────────────────────────────

  async getOrCreateCustomer(companyId: number, phone: string, name?: string): Promise<RetailCustomer> {
    let customer = await RetailCustomer.findOne({
      where: { company_id: companyId, phone },
    });

    if (!customer) {
      customer = await RetailCustomer.create({
        company_id: companyId,
        phone,
        name: name || null,
        addresses: [],
        total_orders: 0,
        total_spent: 0,
        loyalty_points: 0,
        loyalty_tier: 'bronze',
        tags: [],
      });
    } else if (name && !customer.name) {
      await customer.update({ name });
    }

    return customer;
  }

  async updateCustomerStats(companyId: number, phone: string, orderTotal: number): Promise<void> {
    const customer = await this.getOrCreateCustomer(companyId, phone);
    const newTotalOrders = customer.total_orders + 1;
    const newTotalSpent = Number(customer.total_spent) + orderTotal;

    // Atualizar tier
    const config = DEFAULT_LOYALTY_CONFIG;
    let newTier = 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum';
    if (newTotalSpent >= config.tierThresholds.platinum) {
      newTier = 'platinum';
    } else if (newTotalSpent >= config.tierThresholds.gold) {
      newTier = 'gold';
    } else if (newTotalSpent >= config.tierThresholds.silver) {
      newTier = 'silver';
    }

    await customer.update({
      total_orders: newTotalOrders,
      total_spent: newTotalSpent,
      last_order_at: new Date(),
      loyalty_tier: newTier,
    });
  }

  async getCustomerAddresses(companyId: number, phone: string): Promise<CustomerAddress[]> {
    const customer = await this.getOrCreateCustomer(companyId, phone);
    return customer.addresses as CustomerAddress[];
  }

  async addCustomerAddress(
    companyId: number,
    phone: string,
    address: any
  ): Promise<void> {
    const customer = await this.getOrCreateCustomer(companyId, phone);
    const addresses = customer.addresses as any[];

    if (address.is_default) {
      addresses.forEach((a) => (a.is_default = false));
    }

    addresses.push(address);
    await customer.update({ addresses });
  }

  // ─── FIDELIDADE ──────────────────────────────────────────────────

  async addLoyaltyPoints(
    companyId: number,
    phone: string,
    orderId: number,
    orderTotal: number
  ): Promise<void> {
    const customer = await this.getOrCreateCustomer(companyId, phone);
    const config = DEFAULT_LOYALTY_CONFIG;

    const pointsEarned = Math.floor(orderTotal * config.pointsPerReal);
    const balanceBefore = customer.loyalty_points;
    const balanceAfter = balanceBefore + pointsEarned;

    await LoyaltyTransaction.create({
      company_id: companyId,
      customer_id: customer.id,
      order_id: orderId,
      type: 'earn',
      points: pointsEarned,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `Pontos do pedido #${orderId}`,
    });

    await customer.update({ loyalty_points: balanceAfter });
  }

  async redeemLoyaltyPoints(
    companyId: number,
    phone: string,
    points: number
  ): Promise<number> {
    const customer = await this.getOrCreateCustomer(companyId, phone);

    if (customer.loyalty_points < points) {
      throw new Error('Pontos insuficientes');
    }

    const balanceBefore = customer.loyalty_points;
    const balanceAfter = balanceBefore - points;
    const discountValue = points * DEFAULT_LOYALTY_CONFIG.pointValue;

    await LoyaltyTransaction.create({
      company_id: companyId,
      customer_id: customer.id,
      type: 'redeem',
      points: -points,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `Resgate de ${points} pontos`,
    });

    await customer.update({ loyalty_points: balanceAfter });

    return discountValue;
  }

  async getCustomerLoyaltyInfo(companyId: number, phone: string): Promise<{
    points: number;
    tier: string;
    totalOrders: number;
    totalSpent: number;
    nextTier: string;
    pointsToNextTier: number;
  }> {
    const customer = await this.getOrCreateCustomer(companyId, phone);
    const config = DEFAULT_LOYALTY_CONFIG;

    let nextTier = 'silver';
    let pointsToNextTier = config.tierThresholds.silver - customer.loyalty_points;

    if (customer.loyalty_tier === 'silver') {
      nextTier = 'gold';
      pointsToNextTier = config.tierThresholds.gold - customer.loyalty_points;
    } else if (customer.loyalty_tier === 'gold') {
      nextTier = 'platinum';
      pointsToNextTier = config.tierThresholds.platinum - customer.loyalty_points;
    } else if (customer.loyalty_tier === 'platinum') {
      nextTier = 'platinum';
      pointsToNextTier = 0;
    }

    return {
      points: customer.loyalty_points,
      tier: customer.loyalty_tier,
      totalOrders: customer.total_orders,
      totalSpent: Number(customer.total_spent),
      nextTier,
      pointsToNextTier: Math.max(0, pointsToNextTier),
    };
  }

  // ─── PROMOÇÕES ──────────────────────────────────────────────────

  async getActivePromotions(companyId: number): Promise<Promotion[]> {
    const now = new Date();
    return Promotion.findAll({
      where: {
        company_id: companyId,
        is_active: true,
        starts_at: { [Op.lte]: now },
        ends_at: { [Op.gte]: now },
        [Op.or]: [{ usage_limit: null }, { usage_count: { [Op.lt]: 999999 } }],
      },
    });
  }

  async applyCoupon(companyId: number, couponCode: string, subtotal: number): Promise<number> {
    const promotion = await Promotion.findOne({
      where: {
        company_id: companyId,
        coupon_code: couponCode,
        is_active: true,
        starts_at: { [Op.lte]: new Date() },
        ends_at: { [Op.gte]: new Date() },
      },
    });

    if (!promotion) {
      throw new Error('Cupom inválido ou expirado');
    }

    if (promotion.min_order_value && subtotal < Number(promotion.min_order_value)) {
      throw new Error(`Valor mínimo: R$ ${promotion.min_order_value}`);
    }

    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = subtotal * (Number(promotion.discount_value) / 100);
    } else if (promotion.type === 'fixed') {
      discount = Number(promotion.discount_value);
    }

    if (promotion.max_discount && discount > Number(promotion.max_discount)) {
      discount = Number(promotion.max_discount);
    }

    await promotion.update({ usage_count: promotion.usage_count + 1 });

    return discount;
  }

  // ─── ESTATÍSTICAS ──────────────────────────────────────────────────

  async getOrderStats(companyId: number, period: 'today' | 'week' | 'month' = 'today'): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    pendingOrders: number;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }

    const orders = await Order.findAll({
      where: {
        company_id: companyId,
        created_at: { [Op.gte]: startDate },
        status: { [Op.ne]: 'cancelled' },
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;

    return { totalOrders, totalRevenue, averageTicket, pendingOrders };
  }
}

export default new RetailService();