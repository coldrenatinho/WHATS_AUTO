# 🚀 Troubleshooting - CD Pipeline & Deployment

## 📋 Índice
1. [Configurar Slack Webhook](#slack-webhook)
2. [Health Check retorna 404](#health-check-404)
3. [Rollback automático](#rollback-automático)
4. [Smoke Tests falhando](#smoke-tests)

---

## 🔔 Slack Webhook

### Configuração

1. **Criar Webhook no Slack**
   - Acesse [Slack Apps](https://api.slack.com/apps)
   - Clique em **Create New App**
   - Escolha **From scratch**
   - Nome: `whatsauto-deployments`
   - Workspace: Seu workspace do Slack

2. **Ativar Incoming Webhooks**
   - Na aba **Incoming Webhooks**, clique **Activate**
   - Clique em **Add New Webhook to Workspace**
   - Selecione o canal: `#deployments` (ou criar novo)
   - Clique em **Allow**

3. **Copiar URL do Webhook**
   - Em **Webhook URLs for Your Workspace**, copie a URL
   - Exemplo: `https://hooks.slack.com/services/T0...`

4. **Adicionar Secret no GitHub**
   - Vá para: **Settings → Secrets and variables → Actions**
   - Clique em **New repository secret**
   - Nome: `SLACK_WEBHOOK_URL`
   - Cole a URL copiada

### Teste Local
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"✅ Deploy Bem-sucedido"}' \
  $SLACK_WEBHOOK_URL
```

---

## 🏥 Health Check retorna 404

### Causas Comuns

#### 1. API não está respondendo após deploy
```bash
# No servidor de produção, verificar status:
docker compose ps
docker compose logs -f backend --tail=50
```

#### 2. Health check retorna 404 em vez de 200
```bash
# Verificar o endpoint:
curl -v https://api.nortemtsistemas.com.br/health

# Se retornar 404, pode ser:
# - Nginx/proxy não está configurado
# - Backend não subiu corretamente
# - Porta 3000 não está acessível
```

#### 3. Certificado SSL expirado
```bash
# Verificar certificado:
curl -vI https://api.nortemtsistemas.com.br/health

# Se SSL estiver com erro, os smoke tests falham automaticamente
# Renovar com Let's Encrypt:
docker exec whatsauto_traefik \
  certbot renew --force-renewal
```

### Solução Completa

```bash
# 1. SSH no servidor
ssh -i $SSH_KEY ubuntu@api.nortemtsistemas.com.br

# 2. Verificar status dos containers
cd /opt/whatsauto
docker compose ps

# 3. Se backend não está rodando, reiniciar
docker compose up -d --force-recreate backend

# 4. Verificar logs
docker compose logs -f backend --tail=100

# 5. Teste de saúde manual
curl -I http://localhost:3000/health

# 6. Se tiver nginx proxy, verificar configuração
curl -I -H "Host: api.nortemtsistemas.com.br" http://localhost

# 7. Validar SSL/TLS
openssl s_client -connect api.nortemtsistemas.com.br:443 -showcerts
```

---

## 🔄 Rollback Automático

### Como Funciona

1. **Deploy falha** (smoke tests não passam)
2. **Rollback é acionado** automaticamente
3. **Docker para e remove imagens com erro**
4. **Reinicia com última versão estável**

### Verificar Status do Rollback

```bash
# No servidor
docker compose logs --tail=50

# Verificar se backend está respondendo
curl -f https://api.nortemtsistemas.com.br/health

# Verificar versão atual de containers
docker image ls | grep whatsauto
```

### Rollback Manual

```bash
cd /opt/whatsauto

# Para containers com erro
docker compose down

# Remove imagens problemáticas
docker image prune -a -f

# Volta à última imagem estável (do registry)
docker compose pull

# Reinicia
docker compose up -d

# Aguarda 20s e valida
sleep 20
curl -f https://api.nortemtsistemas.com.br/health
```

---

## 🧪 Smoke Tests

### Testes Executados

1. **Health Check** → `GET /health` (esperado: 200)
2. **API Docs** → `GET /api/docs` (esperado: 200)
3. **OpenAPI Schema** → `GET /api/docs.json` (esperado: 200)
4. **Auth Endpoint** → `GET /api/auth/me` (esperado: 200, 401, 403)
5. **Database** → `GET /api/companies` (esperado: 200, 401, 403, 500)

### Parâmetros de Retry

```bash
Timeout por request:    15 segundos
Timeout conexão:        5 segundos
Total retries:          8 tentativas
Delay entre retries:    4 segundos
Tempo total máximo:     ~36 segundos
```

### Debug Local

```bash
# Rodar smoke tests localmente
chmod +x .github/scripts/smoke-tests.sh

# Contra localhost (desenvolvimento)
.github/scripts/smoke-tests.sh "http://localhost:3000"

# Contra produção (requer acesso)
.github/scripts/smoke-tests.sh "https://api.nortemtsistemas.com.br"

# Com verbose output
bash -x .github/scripts/smoke-tests.sh "http://localhost:3000"
```

### Aumentar Verbosidade

Edite `.github/scripts/smoke-tests.sh`:

```bash
# Mude isto:
response=$(curl -s -w "\n%{http_code}" ...)

# Para isto (com verbose):
response=$(curl -v -w "\n%{http_code}" ...)
```

---

## 📊 Logs Importantes

### Backend Logs
```bash
docker compose logs -f backend --tail=200
```

### Docker Compose Status
```bash
docker compose config
docker compose ps
docker compose images
```

### Verificar Variáveis de Ambiente
```bash
docker compose exec backend env | grep -E "API|DATABASE|JWT"
```

---

## ✅ Checklist Pré-Deploy

- [ ] JWT_SECRET válido (mín. 32 caracteres)
- [ ] DATABASE_CONNECTION_URI sem caracteres especiais não URL-encoded
- [ ] SLACK_WEBHOOK_URL configurado
- [ ] SSL/TLS certificados válidos
- [ ] DNS apontando para IP correto
- [ ] Firewall permite portas 80, 443
- [ ] Espaço em disco suficiente no servidor (`df -h`)
- [ ] Memória disponível (`free -h`)
- [ ] Testes locais passando (`npm run test`)

---

## 🆘 Suporte

Se persistir o problema:
1. Verifique os logs do GitHub Actions
2. Conecte-se ao servidor e rode diagnóstico manual
3. Verifique a documentação em `docs/guia-da-aplicacao-e-do-codigo.md`
