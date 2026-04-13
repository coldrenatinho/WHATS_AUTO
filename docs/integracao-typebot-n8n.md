# Integração Typebot + n8n + Backend

## 🏗️ Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE MENSAGENS                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐
│  WhatsApp    │    │  Evolution API  │    │        Backend              │
│  Cliente     │───►│  (Webhook)      │───►│  /api/webhook/evolution     │
└──────────────┘    └─────────────────┘    └──────────────┬──────────────┘
                                                           │
                            ┌──────────────────────────────┼──────────────────────────────┐
                            │                              │                              │
                            ▼                              ▼                              ▼
                   ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
                   │    TYPEBOT      │            │      N8N        │            │   ATENDENTE     │
                   │  (Bot/Fluxo)    │            │  (Automações)   │            │   (Humano)      │
                   │                 │            │                 │            │                 │
                   │  • Saudação     │            │  • Notificações │            │  • Tickets      │
                   │  • Menu         │            │  • Integrações  │            │  • Dashboard    │
                   │  • Coleta dados │            │  • Relatórios   │            │                 │
                   │  • Pedidos      │            │  • Pagamentos   │            │                 │
                   └────────┬────────┘            └────────┬────────┘            └─────────────────┘
                            │                              │
                            │         ┌─────────────────────┘
                            │         │
                            ▼         ▼
                   ┌─────────────────────────┐
                   │      MARIADB (DB)       │
                   │  • Tickets             │
                   │  • Mensagens           │
                   │  • Clientes           │
                   │  • Pedidos             │
                   └─────────────────────────┘
```

---

## 🔧 Configuração do Typebot

### 1. Variáveis Necessárias no Typebot

Crie estas variáveis no seu bot:

| Variável | Descrição | Origem |
|----------|-----------|--------|
| `{{phone}}` | Telefone do cliente | Backend (prefilled) |
| `{{name}}` | Nome do cliente | Backend (prefilled) |
| `{{companyId}}` | ID da empresa | Backend (prefilled) |
| `{{ticketId}}` | ID do ticket | Backend (prefilled) |
| `{{instanceName}}` | Nome da instância WhatsApp | Backend (prefilled) |

### 2. Blocos do Typebot para Varejo

#### Bloco 1: Saudação
```
┌─────────────────────────────────────────┐
│            SAUDAÇÃO INICIAL              │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  "Olá {{name}}! 👋                       │
│   Bem-vindo(a) à {{store_name}}!         │
│                                          │
│   Como posso ajudar?                     │
│                                          │
│   1️⃣ Ver produtos                        │
│   2️⃣ Fazer pedido                        │
│   3️⃣ Tirar dúvida                        │
│   4️⃣ Falar com atendente"                │
└─────────────────────────────────────────┘
                    │
              [Botões/Opções]
                    │
        ┌───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼
    [Produtos]  [Pedido]    [Dúvida]    [Humano]
```

#### Bloco 2: Catálogo de Produtos
```
┌─────────────────────────────────────────┐
│        CATEGORIAS DISPONÍVEIS            │
│                                          │
│  🥤 Bebidas                              │
│  🥖 Padaria                              │
│  🧃 Laticínios                           │
│  🧹 Limpeza                              │
│  🧼 Higiene                             │
└─────────────────────────────────────────┘
                    │
              [Seleção]
                    ▼
┌─────────────────────────────────────────┐
│        PRODUTOS DA CATEGORIA              │
│                                          │
│  Coca-Cola Lata 350ml - R$ 5,00          │
│  Coca-Cola 2L - R$ 10,00                 │
│  Guaraná 2L - R$ 8,00                    │
│                                          │
│  [Adicionar ao carrinho]                 │
└─────────────────────────────────────────┘
```

#### Bloco 3: Fluxo de Pedido
```
[Cliente escolhe produto]
         │
         ▼
┌─────────────────────────┐
│  "Quantas unidades?"    │
│                         │
│  [Input: Número]        │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  ✅ Adicionado!         │
│                         │
│  Carrinho: R$ XX,XX     │
│                         │
│  Quer mais algo?        │
│  [Sim] [Não, finalizar] │
└─────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
[Voltar]  [Finalizar]
              │
              ▼
    ┌─────────────────────┐
    │  ENDEREÇO DE ENTREGA│
    │                     │
    │  [Input: Endereço]  │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  RESUMO DO PEDIDO    │
    │                      │
    │  Itens: ...          │
    │  Total: R$ XX,XX     │
    │  Entrega: R$ X,XX    │
    │                      │
    │  Forma de pagamento: │
    │  [PIX] [Cartão] [Dinheiro] │
    └─────────────────────┘
```

### 3. Integração Typebot → Backend (Webhook)

Configure um webhook no Typebot para enviar pedidos:

```javascript
// URL: {{backend_url}}/api/webhooks/orders
// Método: POST

{
  "companyId": "{{companyId}}",
  "ticketId": "{{ticketId}}",
  "phone": "{{phone}}",
  "order": {
    "items": [
      {
        "productId": "prod_001",
        "name": "Coca-Cola Lata 350ml",
        "quantity": 2,
        "unitPrice": 5.00
      }
    ],
    "deliveryAddress": "{{address}}",
    "total": 15.00,
    "paymentMethod": "{{payment_method}}"
  }
}
```

---

## ⚙️ Configuração do n8n

### 1. Webhook para Receber do Backend

O backend já envia para: `http://n8n:5678/webhook/whatsapp`

Payload recebido:

```json
{
  "event": "message.inbound",
  "companyId": 1,
  "ticketId": 123,
  "messageId": 456,
  "instanceName": "empresa-x",
  "phone": "5565999998888",
  "name": "João Silva",
  "text": "Olá, quero fazer um pedido",
  "metadata": {},
  "receivedAt": "2026-04-13T17:00:00.000Z"
}
```

### 2. Workflow n8n: Processar Mensagens

```json
{
  "name": "Processar Mensagens WhatsApp",
  "nodes": [
    {
      "name": "Webhook Backend",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Classificar Intenção",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "headers": {
          "Authorization": "Bearer {{$env.GEMINI_API_KEY}}"
        },
        "body": {
          "model": "gemini-2.0-flash",
          "messages": [
            {
              "role": "system",
              "content": "Classifique a intenção: pedido, consulta, reclamação, humano"
            },
            {
              "role": "user",
              "content": "={{$json.text}}"
            }
          ]
        }
      }
    },
    {
      "name": "Switch por Intenção",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "rules": [
          { "output": "pedido" },
          { "output": "consulta" },
          { "output": "reclamacao" },
          { "output": "humano" }
        ]
      }
    },
    {
      "name": "Notificar Atendente",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "{{$env.BACKEND_URL}}/api/notifications/attendant",
        "body": {
          "ticketId": "={{$json.ticketId}}",
          "phone": "={{$json.phone}}",
          "reason": "humano_requested"
        }
      }
    }
  ]
}
```

### 3. Workflow n8n: Confirmar Pagamento

```json
{
  "name": "Processar Pagamentos",
  "nodes": [
    {
      "name": "Webhook Mercado Pago",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "payment-callback"
      }
    },
    {
      "name": "Atualizar Pedido",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "PATCH",
        "url": "{{$env.BACKEND_URL}}/api/orders/{{$json.external_reference}}",
        "headers": {
          "Authorization": "Bearer {{$env.API_SECRET}}"
        },
        "body": {
          "paymentStatus": "confirmed",
          "paymentId": "={{$json.payment_id}}"
        }
      }
    },
    {
      "name": "Notificar Cliente via Evolution",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "{{$env.EVOLUTION_URL}}/message/sendText/{{$env.INSTANCE}}",
        "headers": {
          "apikey": "{{$env.EVOLUTION_KEY}}"
        },
        "body": {
          "number": "={{$json.customer_phone}}",
          "text": "✅ Pagamento confirmado! Seu pedido está sendo preparado."
        }
      }
    }
  ]
}
```

---

## 🔄 Fluxo Completo: Typebot + n8n

### Cenário: Cliente Faz Pedido

```
1. CLIENTE ENVIA MENSAGEM
   WhatsApp: "Oi"

2. EVOLUTION API → BACKEND (Webhook)
   POST /api/webhook/evolution
   { from: "5565999998888", body: "Oi" }

3. BACKEND CRIA TICKET
   - Cria registro na tabela tickets
   - Cria/consulta cliente
   - Decide rota: Typebot (automated) ou Humano

4. BACKEND → TYPEBOT
   TypebotService.dispatchInboundMessage({
     typebotUrl: "https://typebot.nortemt.com.br/bot-varejo",
     message: "Oi",
     contactPhone: "5565999998888",
     ticketId: 123,
     companyId: 1,
     instanceName: "empresa-varejo"
   })

5. TYPEBOT PROCESSA
   - Executa fluxo de saudação
   - Coleta dados do pedido
   - Monta carrinho
   - Ao final, envia webhook para backend

6. TYPEBOT → BACKEND (Webhook de Pedido)
   POST /api/webhooks/orders
   {
     ticketId: 123,
     phone: "5565999998888",
     order: { items: [...], total: 50.00, payment: "pix" }
   }

7. BACKEND CRIA PEDIDO
   - Salva na tabela orders
   - Gera link/QR de pagamento
   - Atualiza ticket

8. BACKEND → EVOLUTION (Resposta)
   Envia QR Code PIX + confirmação

9. PARALELO: BACKEND → N8N (Notificação)
   N8nService.dispatchInboundMessage({
     companyId: 1,
     ticketId: 123,
     event: "order.created",
     phone: "5565999998888"
   })

10. N8N PROCESSA
    - Registra métrica
    - Envia notificação para dono da loja
    - Agenda relatório
```

---

## 📡 Endpoints do Backend

### Receber Webhook Evolution API

```
POST /api/webhook/evolution/:instanceName

Body (Evolution API format):
{
  "event": "messages.upsert",
  "instance": "empresa-varejo",
  "data": {
    "key": {
      "remoteJid": "5565999998888@s.whatsapp.net",
      "fromMe": false
    },
    "message": {
      "conversation": "Oi"
    },
    "pushName": "João Silva"
  }
}
```

### Criar Pedido (via Typebot)

```
POST /api/webhooks/orders

Body:
{
  "companyId": 1,
  "ticketId": 123,
  "phone": "5565999998888",
  "order": {
    "items": [
      { "productId": "prod_001", "name": "Coca-Cola Lata", "quantity": 2, "unitPrice": 5.00 }
    ],
    "deliveryAddress": "Rua das Flores, 123",
    "total": 15.00,
    "paymentMethod": "pix"
  }
}
```

### Webhook n8n (para enviar mensagens)

```
POST /api/webhooks/n8n/outbound

Body:
{
  "ticketId": 123,
  "message": "Seu pedido está a caminho! 🚚",
  "type": "text"
}
```

---

## 🔐 Autenticação

### Backend → n8n

Header: `x-webhook-secret: {{N8N_WEBHOOK_SECRET}}`

Variável de ambiente no backend:
```
N8N_WEBHOOK_URL=http://n8n:5678
N8N_WEBHOOK_SECRET=sua-chave-secreta
```

### n8n → Backend

Header: `Authorization: Bearer {{API_SECRET}}`

Variável no n8n:
```
BACKEND_URL=http://backend:3000/api
API_SECRET=sua-chave-api
```

---

## 🧪 Testes

### Testar Typebot

```bash
# Iniciar conversa com Typebot
curl -X POST https://typebot.nortemt.com.br/api/v1/typebots/bot-varejo/startChat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Oi",
    "prefilledVariables": {
      "phone": "5565999998888",
      "name": "João Teste",
      "companyId": "1",
      "ticketId": "999",
      "instanceName": "test-instance"
    }
  }'
```

### Testar n8n Webhook

```bash
curl -X POST http://localhost:5678/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: sua-chave-secreta" \
  -d '{
    "event": "message.inbound",
    "companyId": 1,
    "ticketId": 123,
    "phone": "5565999998888",
    "name": "João Teste",
    "text": "Quero fazer um pedido"
  }'
```

---

## 📋 Checklist de Integração

### Backend
- [ ] Configurar `TYPEBOT_URL` no .env
- [ ] Configurar `N8N_WEBHOOK_URL` no .env
- [ ] Configurar `N8N_WEBHOOK_SECRET` no .env
- [ ] Verificar se `TypebotService` está sendo chamado no webhook controller
- [ ] Verificar se `N8nService` está sendo chamado no webhook controller

### Typebot
- [ ] Criar bot com fluxo de varejo
- [ ] Configurar variáveis prefilled
- [ ] Adicionar webhook de finalização de pedido
- [ ] Testar fluxo completo

### n8n
- [ ] Importar workflow de processamento
- [ ] Configurar credenciais (Gemini, Backend, Evolution)
- [ ] Criar workflow de notificações
- [ ] Testar webhook reception

### Evolution API
- [ ] Configurar webhook para apontar para backend
- [ ] Testar recebimento de mensagens
- [ ] Testar envio de respostas

---

## 🚀 Próximos Passos

1. **Subir Typebot localmente** (ou usar instância existente)
2. **Criar bot de varejo** no Typebot com o fluxo acima
3. **Configurar backend** para chamar Typebot no webhook
4. **Importar workflows n8n** para notificações
5. **Testar fluxo completo** end-to-end

Quer que eu crie o arquivo de configuração do bot Typebot (exportável)?