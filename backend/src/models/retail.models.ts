import { Model, DataTypes, Sequelize } from 'sequelize';

// ═══════════════════════════════════════════════════════════════
// MODELOS VAREJO - MVP 2.0
// ═══════════════════════════════════════════════════════════════

// Product - Produto do catálogo
export class Product extends Model {
  declare id: number;
  declare company_id: number;
  declare category_id: number | null;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare sku: string | null;
  declare price: number;
  declare compare_price: number | null;
  declare stock_quantity: number;
  declare stock_unlimited: boolean;
  declare image_url: string | null;
  declare is_active: boolean;
  declare is_featured: boolean;
  declare search_terms: string[];
  declare metadata: Record<string, unknown>;
  declare created_at: Date;
  declare updated_at: Date;
}

// Category - Categoria de produtos
export class Category extends Model {
  declare id: number;
  declare company_id: number;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare image_url: string | null;
  declare parent_id: number | null;
  declare display_order: number;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

// Cart - Carrinho de compras
export class Cart extends Model {
  declare id: number;
  declare company_id: number;
  declare ticket_id: number;
  declare contact_phone: string;
  declare status: 'active' | 'abandoned' | 'converted';
  declare items: CartItem[];
  declare subtotal: number;
  declare delivery_fee: number;
  declare discount: number;
  declare total: number;
  declare delivery_address: string | null;
  declare delivery_notes: string | null;
  declare payment_method: 'pix' | 'card' | 'cash' | null;
  declare metadata: Record<string, unknown>;
  declare created_at: Date;
  declare updated_at: Date;
}

export interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

// Order - Pedido finalizado
export class Order extends Model {
  declare id: number;
  declare company_id: number;
  declare ticket_id: number;
  declare cart_id: number;
  declare order_number: string;
  declare status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  declare items: CartItem[];
  declare subtotal: number;
  declare delivery_fee: number;
  declare discount: number;
  declare total: number;
  declare delivery_address: string;
  declare delivery_notes: string | null;
  declare payment_method: 'pix' | 'card' | 'cash';
  declare payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  declare payment_id: string | null;
  declare payment_link: string | null;
  declare payment_qr_code: string | null;
  declare payment_expires_at: Date | null;
  declare customer_notes: string | null;
  declare confirmed_at: Date | null;
  declare delivered_at: Date | null;
  declare cancelled_at: Date | null;
  declare cancel_reason: string | null;
  declare metadata: Record<string, unknown>;
  declare created_at: Date;
  declare updated_at: Date;
}

// RetailCustomer - Cliente do varejo (extende dados do ticket)
export class RetailCustomer extends Model {
  declare id: number;
  declare company_id: number;
  declare phone: string;
  declare name: string | null;
  declare email: string | null;
  declare addresses: CustomerAddress[];
  declare total_orders: number;
  declare total_spent: number;
  declare loyalty_points: number;
  declare loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  declare preferred_payment: string | null;
  declare last_order_at: Date | null;
  declare tags: string[];
  declare notes: string | null;
  declare is_blocked: boolean;
  declare metadata: Record<string, unknown>;
  declare created_at: Date;
  declare updated_at: Date;
}

export interface CustomerAddress {
  label: string;
  address: string;
  city: string;
  is_default: boolean;
}

// LoyaltyTransaction - Transação de pontos de fidelidade
export class LoyaltyTransaction extends Model {
  declare id: number;
  declare company_id: number;
  declare customer_id: number;
  declare order_id: number | null;
  declare type: 'earn' | 'redeem' | 'expire' | 'adjust';
  declare points: number;
  declare balance_before: number;
  declare balance_after: number;
  declare description: string;
  declare metadata: Record<string, unknown>;
  declare created_at: Date;
}

// Promotion - Promoção/Oferta
export class Promotion extends Model {
  declare id: number;
  declare company_id: number;
  declare name: string;
  declare description: string | null;
  declare type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'loyalty_multiplier';
  declare discount_value: number;
  declare min_order_value: number | null;
  declare max_discount: number | null;
  declare product_ids: number[];
  declare category_ids: number[];
  declare starts_at: Date;
  declare ends_at: Date;
  declare coupon_code: string | null;
  declare usage_limit: number | null;
  declare usage_count: number;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO DOS MODELOS
// ═══════════════════════════════════════════════════════════════

export function initRetailModels(sequelize: Sequelize): void {
  // Category
  Category.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: { type: DataTypes.STRING(100), allowNull: false },
      description: { type: DataTypes.TEXT },
      image_url: { type: DataTypes.TEXT },
      parent_id: { type: DataTypes.INTEGER },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_categories',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['slug'], unique: true },
        { fields: ['is_active'] },
      ],
    }
  );

  // Product
  Product.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      category_id: { type: DataTypes.INTEGER },
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT },
      sku: { type: DataTypes.STRING(100) },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      compare_price: { type: DataTypes.DECIMAL(10, 2) },
      stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      stock_unlimited: { type: DataTypes.BOOLEAN, defaultValue: false },
      image_url: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
      search_terms: { type: DataTypes.JSON, defaultValue: [] },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_products',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['category_id'] },
        { fields: ['slug'] },
        { fields: ['is_active'] },
        { fields: ['is_featured'] },
      ],
    }
  );

  // RetailCustomer
  RetailCustomer.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      name: { type: DataTypes.STRING(255) },
      email: { type: DataTypes.STRING(255) },
      addresses: { type: DataTypes.JSON, defaultValue: [] },
      total_orders: { type: DataTypes.INTEGER, defaultValue: 0 },
      total_spent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      loyalty_points: { type: DataTypes.INTEGER, defaultValue: 0 },
      loyalty_tier: {
        type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
        defaultValue: 'bronze',
      },
      preferred_payment: { type: DataTypes.STRING(50) },
      last_order_at: { type: DataTypes.DATE },
      tags: { type: DataTypes.JSON, defaultValue: [] },
      notes: { type: DataTypes.TEXT },
      is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_customers',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['phone'] },
        { unique: true, fields: ['company_id', 'phone'] },
      ],
    }
  );

  // Cart
  Cart.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      ticket_id: { type: DataTypes.INTEGER },
      contact_phone: { type: DataTypes.STRING(20), allowNull: false },
      status: {
        type: DataTypes.ENUM('active', 'abandoned', 'converted'),
        defaultValue: 'active',
      },
      items: { type: DataTypes.JSON, defaultValue: [] },
      subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      delivery_address: { type: DataTypes.TEXT },
      delivery_notes: { type: DataTypes.TEXT },
      payment_method: { type: DataTypes.ENUM('pix', 'card', 'cash') },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_carts',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['ticket_id'] },
        { fields: ['contact_phone'] },
        { fields: ['status'] },
      ],
    }
  );

  // Order
  Order.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      ticket_id: { type: DataTypes.INTEGER },
      cart_id: { type: DataTypes.INTEGER },
      order_number: { type: DataTypes.STRING(50), allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },
      items: { type: DataTypes.JSON, defaultValue: [] },
      subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      delivery_address: { type: DataTypes.TEXT, allowNull: false },
      delivery_notes: { type: DataTypes.TEXT },
      payment_method: { type: DataTypes.ENUM('pix', 'card', 'cash'), allowNull: false },
      payment_status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      payment_id: { type: DataTypes.STRING(100) },
      payment_link: { type: DataTypes.TEXT },
      payment_qr_code: { type: DataTypes.TEXT },
      payment_expires_at: { type: DataTypes.DATE },
      customer_notes: { type: DataTypes.TEXT },
      confirmed_at: { type: DataTypes.DATE },
      delivered_at: { type: DataTypes.DATE },
      cancelled_at: { type: DataTypes.DATE },
      cancel_reason: { type: DataTypes.TEXT },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_orders',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['ticket_id'] },
        { fields: ['order_number'], unique: true },
        { fields: ['status'] },
        { fields: ['payment_status'] },
      ],
    }
  );

  // LoyaltyTransaction
  LoyaltyTransaction.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      order_id: { type: DataTypes.INTEGER },
      type: {
        type: DataTypes.ENUM('earn', 'redeem', 'expire', 'adjust'),
        allowNull: false,
      },
      points: { type: DataTypes.INTEGER, allowNull: false },
      balance_before: { type: DataTypes.INTEGER, allowNull: false },
      balance_after: { type: DataTypes.INTEGER, allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: false },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_loyalty_transactions',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['customer_id'] },
        { fields: ['order_id'] },
        { fields: ['type'] },
      ],
    }
  );

  // Promotion
  Promotion.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      company_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT },
      type: {
        type: DataTypes.ENUM('percentage', 'fixed', 'buy_x_get_y', 'loyalty_multiplier'),
        allowNull: false,
      },
      discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      min_order_value: { type: DataTypes.DECIMAL(10, 2) },
      max_discount: { type: DataTypes.DECIMAL(10, 2) },
      product_ids: { type: DataTypes.JSON, defaultValue: [] },
      category_ids: { type: DataTypes.JSON, defaultValue: [] },
      starts_at: { type: DataTypes.DATE, allowNull: false },
      ends_at: { type: DataTypes.DATE, allowNull: false },
      coupon_code: { type: DataTypes.STRING(50), unique: true },
      usage_limit: { type: DataTypes.INTEGER },
      usage_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'retail_promotions',
      indexes: [
        { fields: ['company_id'] },
        { fields: ['is_active'] },
        { fields: ['starts_at', 'ends_at'] },
        { fields: ['coupon_code'], unique: true },
      ],
    }
  );

  // Associações
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
}

export default {
  Product,
  Category,
  Cart,
  Order,
  RetailCustomer,
  LoyaltyTransaction,
  Promotion,
  initRetailModels,
};