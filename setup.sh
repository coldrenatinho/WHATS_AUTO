#!/bin/bash
# ══════════════════════════════════════════════════════════
#   SETUP COMPLETO DO BOT WHATSAPP COM IA
#   Execute: bash setup.sh
# ══════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   WhatsApp Bot Comercial com IA — Setup      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# 1. Verifica dependências
echo "▶ Verificando dependências..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker não encontrado. Instale em https://docker.com"; exit 1; }
command -v docker compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose não encontrado."; exit 1; }
echo "✅ Docker OK"

# 2. Cria .env se não existir
if [ ! -f .env ]; then
  echo "▶ Criando .env a partir do exemplo..."
  cp .env.example .env
  echo "⚠️  EDITE o arquivo .env com suas chaves antes de continuar!"
  echo "   Especialmente: GEMINI_API_KEY, EVOLUTION_API_KEY, N8N_PASSWORD, ADMIN_EMAIL e ADMIN_PASSWORD"
  echo ""
  read -p "   Pressione ENTER após editar o .env..." _
fi

# 3. Cria pasta para dados do bot (SQLite)
echo "▶ Criando pasta de dados..."
mkdir -p bot_data
echo "✅ Pasta bot_data/ criada (SQLite do bot ficará aqui)"

# 4. Sobe os containers
echo ""
echo "▶ Iniciando containers (isso pode demorar na primeira vez)..."
docker compose up -d

echo ""
echo "▶ Aguardando containers ficarem prontos..."
sleep 15

# 5. Cria instância na Evolution API
echo ""
echo "▶ Configurando instância na Evolution API..."

source .env

CREATE_RESP=$(curl -s -X POST "${EVOLUTION_SERVER_URL}/instance/create" \
  -H "apikey: ${EVOLUTION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"instanceName\": \"${EVOLUTION_INSTANCE}\",
    \"qrcode\": true,
    \"integration\": \"WHATSAPP-BAILEYS\"
  }" 2>/dev/null)

echo "Resposta da Evolution API: $CREATE_RESP"
echo ""

# 6. Configura webhook na instância
echo "▶ Configurando webhook na instância..."

WEBHOOK_URL_BOT="${WEBHOOK_URL}/webhook/whatsapp"

WEBHOOK_RESP=$(curl -s -X POST "${EVOLUTION_SERVER_URL}/webhook/set/${EVOLUTION_INSTANCE}" \
  -H "apikey: ${EVOLUTION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${WEBHOOK_URL_BOT}\",
    \"webhook_by_events\": false,
    \"webhook_base64\": false,
    \"events\": [\"MESSAGES_UPSERT\"]
  }" 2>/dev/null)

echo "Webhook configurado: $WEBHOOK_RESP"
echo ""

# 7. Busca QR Code para conectar WhatsApp
echo "▶ Gerando QR Code para conectar WhatsApp..."
sleep 3

QR_RESP=$(curl -s -X GET "${EVOLUTION_SERVER_URL}/instance/connect/${EVOLUTION_INSTANCE}" \
  -H "apikey: ${EVOLUTION_API_KEY}" 2>/dev/null)

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ SETUP CONCLUÍDO!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📱 PRÓXIMOS PASSOS:"
echo ""
echo "1. Acesse o n8n: http://localhost:5678"
echo "   Usuário: $N8N_USER"
echo "   Senha: (a que você definiu no .env)"
echo ""
echo "2. Importe o workflow:"
echo "   n8n → Settings → Import Workflow → workflow_whatsapp_bot.json"
echo ""
echo "3. Ative o workflow (toggle no canto superior direito)"
echo ""
echo "4. Escaneie o QR Code do WhatsApp:"
echo "   Acesse: ${EVOLUTION_SERVER_URL}/instance/connect/${EVOLUTION_INSTANCE}"
echo "   Use o header apikey: ${EVOLUTION_API_KEY}"
echo "   Ou acesse o Evolution API Manager em: ${EVOLUTION_SERVER_URL}/manager"
echo ""
echo "5. Teste enviando uma mensagem para o número conectado!"
echo ""
echo "🔍 Logs dos containers:"
echo "   docker compose logs -f n8n"
echo "   docker compose logs -f evolution"
echo ""
