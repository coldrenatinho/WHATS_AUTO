import retailService from './retail.service';
import logger from '../utils';

// ═══════════════════════════════════════════════════════════════
// AGENTE IA VAREJO - MVP 2.0
// ═══════════════════════════════════════════════════════════════

interface ConversationContext {
  companyId: number;
  ticketId: number;
  phone: string;
  name: string | null;
  cartId: number | null;
  cartTotal: number;
  step: 'greeting' | 'browsing' | 'ordering' | 'checkout' | 'payment' | 'confirmed';
  lastProductViewed: number | null;
  deliveryAddress: string | null;
  paymentMethod: 'pix' | 'card' | 'cash' | null;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface AIResponse {
  intent: 'saudacao' | 'consulta' | 'pedido' | 'add_cart' | 'remove_cart' | 'finalizar' | 'cancelar' | 'humano' | 'duvida';
  reply: string;
  cartUpdate?: {
    action: 'add' | 'remove' | 'clear';
    productId?: number;
    productName?: string;
    quantity?: number;
    unitPrice?: number;
  };
  checkoutProgress?: {
    step: string;
    data?: Record<string, unknown>;
  };
  tag: 'lead_frio' | 'lead_morno' | 'lead_quente';
  extract: {
    name?: string;
    address?: string;
    product?: string;
    quantity?: number;
    paymentMethod?: 'pix' | 'card' | 'cash';
  };
}

interface GeminiChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

class RetailAIService {
  private geminiApiKey: string;
  private geminiUrl: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
  }

  async processMessage(
    phone: string,
    message: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    try {
      // Buscar dados do contexto
      const [products, categories, promotions, loyaltyInfo] = await Promise.all([
        retailService.searchProducts({ companyId: context.companyId, query: '', limit: 50 }),
        retailService.getCategories(context.companyId),
        retailService.getActivePromotions(context.companyId),
        retailService.getCustomerLoyaltyInfo(context.companyId, phone).catch(() => null),
      ]);

      // Montar prompt
      const systemPrompt = this.buildSystemPrompt(context, products, categories, promotions, loyaltyInfo);

      // Chamar Gemini
      const response = await this.callGemini(systemPrompt, context.history, message);

      // Parse da resposta
      const aiResponse = this.parseAIResponse(response);

      // Executar ações se necessário
      if (aiResponse.cartUpdate) {
        await this.executeCartAction(context, aiResponse.cartUpdate);
      }

      return aiResponse;
    } catch (error) {
      logger.error('Erro no processamento IA', error);
      return this.getFallbackResponse();
    }
  }

  private buildSystemPrompt(
    context: ConversationContext,
    products: Array<{ id: number; name: string; price: number; stock_quantity: number; stock_unlimited: boolean }>,
    categories: Array<{ id: number; name: string }>,
    promotions: Array<{ name: string; description: string | null; type: string; discount_value: number }>,
    loyaltyInfo: { points: number; tier: string } | null
  ): string {
    const productsList = products
      .filter((p) => p.stock_unlimited || p.stock_quantity > 0)
      .slice(0, 20)
      .map((p) => `ID:${p.id}|${p.name}|R$${Number(p.price).toFixed(2)}`)
      .join('\n');

    const promotionsList = promotions
      .map((p) => `${p.name}: ${p.description || `${p.type} ${p.discount_value}`}`)
      .join('\n');

    return `Você é Lari, assistente virtual de uma loja de varejo. Seja simpática, direta e prestativa.

══════════════════════════════════════════════════════════════
DADOS DO CLIENTE
══════════════════════════════════════════════════════════════
Nome: ${context.name || 'Não informado'}
Telefone: ${context.phone}
Carrinho ID: ${context.cartId || 'Nenhum'}
Total no carrinho: R$ ${context.cartTotal.toFixed(2)}
Endereço: ${context.deliveryAddress || 'Não informado'}
Etapa atual: ${context.step}

FIDELIDADE:
Pontos: ${loyaltyInfo?.points || 0}
Nível: ${loyaltyInfo?.tier || 'bronze'}

══════════════════════════════════════════════════════════════
CATÁLOGO DISPONÍVEL
══════════════════════════════════════════════════════════════
CATEGORIAS:
${categories.map((c) => `• ${c.name}`).join('\n')}

PRODUTOS (id|nome|preço):
${productsList}

PROMOÇÕES ATIVAS:
${promotionsList || 'Nenhuma promoção ativa'}

══════════════════════════════════════════════════════════════
REGRAS DE ATENDIMENTO
══════════════════════════════════════════════════════════════
1. Seja simpática mas objetiva (máx 3 frases)
2. Use no máximo 1 emoji por mensagem
3. Para pedidos, use o ID do produto do catálogo
4. Confirme sempre antes de finalizar
5. Se produto não estiver na lista, diga que não tem
6. Para estoque baixo, avise o cliente

FLUXO DE PEDIDO:
1. Cliente pede produto → Mostre preço e pergunte quantidade
2. Cliente escolhe quantidade → Adicione ao carrinho
3. Pergunte se quer mais algo
4. Quando finalizar → Peça endereço
5. Confirme pedido completo → Peça pagamento
6. Gere QR PIX se necessário

══════════════════════════════════════════════════════════════
RETORNE JSON VÁLIDO (sem markdown)
══════════════════════════════════════════════════════════════
{
  "intent": "saudacao|consulta|pedido|add_cart|remove_cart|finalizar|cancelar|humano|duvida",
  "reply": "Resposta para o cliente",
  "cartUpdate": { "action": "add|remove|clear", "productId": ID, "quantity": N },
  "tag": "lead_frio|lead_morno|lead_quente",
  "extract": { "name": null, "address": null, "product": null, "quantity": null }
}

EXEMPLOS:
Cliente: "Oi"
→ {"intent":"saudacao","reply":"Olá! 👋 Sou a Lari, assistente da loja. Como posso ajudar? Ver produtos, fazer pedido ou tirar dúvidas?","tag":"lead_frio","extract":{}}

Cliente: "Tem Coca-Cola?"
→ {"intent":"consulta","reply":"Temos! 🥤\\n• Coca-Cola Lata 350ml - R$ 5,00 (ID: 123)\\nQuantas você quer?","tag":"lead_morno","extract":{"product":"Coca-Cola"}}

Cliente: "2 latas"
→ {"intent":"add_cart","reply":"✅ Adicionei 2x Coca-Cola Lata (R$ 10,00)\\nQuer mais alguma coisa?","cartUpdate":{"action":"add","productId":123,"quantity":2},"tag":"lead_morno","extract":{}}

Cliente: "Só isso"
→ {"intent":"finalizar","reply":"Perfeito! Seu pedido totaliza R$ 10,00 + R$ 5,00 entrega = R$ 15,00\\nPara onde entregamos?","tag":"lead_quente","extract":{}}

Cliente: "Quero falar com alguém"
→ {"intent":"humano","reply":"Claro! Vou te passar para um atendente. Um momento... 😊","tag":"lead_morno","extract":{}}`;
  }

  private async callGemini(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch(this.geminiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.geminiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = (await response.json()) as GeminiChatResponse;
    return data.choices?.[0]?.message?.content ?? '';
  }

  private parseAIResponse(rawResponse: string): AIResponse {
    try {
      const parsed = JSON.parse(rawResponse);

      // Validar campos obrigatórios
      const validIntents = ['saudacao', 'consulta', 'pedido', 'add_cart', 'remove_cart', 'finalizar', 'cancelar', 'humano', 'duvida'];
      const validTags = ['lead_frio', 'lead_morno', 'lead_quente'];

      return {
        intent: validIntents.includes(parsed.intent) ? parsed.intent : 'duvida',
        reply: parsed.reply || 'Posso ajudar com algo mais?',
        cartUpdate: parsed.cartUpdate || undefined,
        tag: validTags.includes(parsed.tag) ? parsed.tag : 'lead_frio',
        extract: parsed.extract || {},
      };
    } catch {
      return this.getFallbackResponse();
    }
  }

  private async executeCartAction(
    context: ConversationContext,
    cartUpdate: NonNullable<AIResponse['cartUpdate']>
  ): Promise<void> {
    if (!context.cartId) {
      const cart = await retailService.getOrCreateCart(context.companyId, context.phone, context.ticketId);
      context.cartId = cart.id;
    }

    switch (cartUpdate.action) {
      case 'add':
        if (cartUpdate.productId && cartUpdate.quantity) {
          await retailService.addToCart({
            companyId: context.companyId,
            ticketId: context.ticketId,
            phone: context.phone,
            productId: cartUpdate.productId,
            quantity: cartUpdate.quantity,
          });
        }
        break;
      case 'remove':
        if (cartUpdate.productId) {
          await retailService.removeFromCart(context.companyId, context.cartId, cartUpdate.productId);
        }
        break;
      case 'clear':
        await retailService.clearCart(context.companyId, context.cartId);
        break;
    }
  }

  private getFallbackResponse(): AIResponse {
    return {
      intent: 'humano',
      reply: 'Desculpe, tive um probleminha aqui. Vou te passar para um atendente! 😊',
      tag: 'lead_morno',
      extract: {},
    };
  }

  // ─── INTENTS ESPECÍFICOS ─────────────────────────────────────

  async handleGreeting(context: ConversationContext): Promise<string> {
    const promotions = await retailService.getActivePromotions(context.companyId);
    const featured = await retailService.getFeaturedProducts(context.companyId);

    let message = `Olá! 👋 Sou a Lari, assistente virtual da loja.\n\n`;
    message += `Como posso ajudar?\n`;
    message += `1️⃣ Ver produtos\n`;
    message += `2️⃣ Fazer pedido\n`;
    message += `3️⃣ Ver promoções\n`;
    message += `4️⃣ Falar com atendente`;

    if (promotions.length > 0) {
      message += `\n\n🔥 Promoção: ${promotions[0].name}`;
    }

    return message;
  }

  async handleProductSearch(query: string, context: ConversationContext): Promise<string> {
    const products = await retailService.searchProducts({
      companyId: context.companyId,
      query,
      limit: 5,
    });

    if (products.length === 0) {
      return `Não encontrei "${query}" no catálogo. 😕\nQuer buscar outro produto?`;
    }

    const list = products
      .map((p) => `• ${p.name} - R$ ${Number(p.price).toFixed(2)} (ID: ${p.id})`)
      .join('\n');

    return `Encontrei:\n${list}\n\nQual você quer e quantas?`;
  }

  async handleCheckout(context: ConversationContext, address: string): Promise<string> {
    if (!context.cartId) {
      return 'Seu carrinho está vazio! Quer ver nossos produtos?';
    }

    const { Cart } = await import('../models/retail.models');
    const cart = await Cart.findByPk(context.cartId);

    if (!cart || (cart.items as Array<unknown>).length === 0) {
      return 'Seu carrinho está vazio! Quer ver nossos produtos?';
    }

    const items = cart.items as Array<{ product_name: string; quantity: number; total_price: number }>;
    const itemsList = items.map((i) => `• ${i.quantity}x ${i.product_name} - R$ ${i.total_price.toFixed(2)}`).join('\n');

    return `📦 Seu pedido:\n${itemsList}\n\nTotal: R$ ${Number(cart.total).toFixed(2)}\n\nPara onde entregamos?\n${address ? `Confirmar: ${address}?` : 'Qual o endereço?'}`;
  }
}

export default new RetailAIService();