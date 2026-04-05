# Configuração de Entrega Contínua (GitHub Actions)

## 📋 Visão Geral

Este projeto possui três pipelines de CI/CD automatizadas:

1. **CI (ci.yml)** - Executada em push para `main`/`develop` e PRs
   - Lint de código
   - Build de Docker images
   - Testes automatizados
   - Validação de commit messages

2. **CD (cd.yml)** - Executada em push para `main`
   - Build e push de Docker images para GHCR
   - Deploy automático via SSH
   - Smoke tests após deploy
   - Notificações no Slack
   - Rollback automático em caso de falha

3. **Release (release.yml)** - Executada ao criar tags `v*`
   - Gera releases automáticas no GitHub
   - Documenta changelog
   - Referencia Docker images

## 🔐 Secrets Requeridos

Configure os seguintes secrets no GitHub (`Settings → Secrets and variables → Actions`):

### Secrets para Deploy (CD)
```
SERVER_HOST          - IP ou hostname do servidor (ex: 192.168.1.100)
SERVER_USER          - Usuário SSH (ex: ubuntu)
SSH_PRIVATE_KEY      - Chave privada SSH para autenticar (sem passphrase)
```

### Secrets para Notificações Slack
```
SLACK_WEBHOOK_URL    - URL do Webhook do Slack (ex: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX)
```

## 🔑 Como Gerar as Chaves SSH

### 1. Gerar chave SSH (no seu computador local)
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""
```

### 2. Copiar chave pública para o servidor
```bash
ssh-copy-id -i ~/.ssh/github_actions.pub usuario@seu-servidor.com
```

Ou manualmente:
```bash
cat ~/.ssh/github_actions.pub | ssh usuario@seu-servidor.com 'cat >> ~/.ssh/authorized_keys'
```

### 3. Obter chave privada para GitHub
```bash
cat ~/.ssh/github_actions
```

Copie todo o conteúdo (inclusive `-----BEGIN RSA PRIVATE KEY-----` e `-----END RSA PRIVATE KEY-----`) e cole no secret `SSH_PRIVATE_KEY`.

## 🤖 Webhook do Slack

### 1. Criar Webhook no Slack
- Acesse [https://api.slack.com/apps](https://api.slack.com/apps)
- Crie um novo app ou selecione existente
- Vá para "Incoming Webhooks" e ative
- Clique em "Add New Webhook to Workspace"
- Selecione o canal desejado e autorize
- Copie a URL completa

### 2. Adicionar ao GitHub
- Vá para `Settings → Secrets and variables → Actions`
- Clique em "New repository secret"
- Name: `SLACK_WEBHOOK_URL`
- Value: Cole a URL do webhook

## 📁 Estrutura do Deploy

### Diretório no servidor
```
/opt/whatsauto/
├── docker-compose.yml      # Mantém imagens atualizadas
├── .env                     # Variáveis de ambiente
├── frontend/               # (opcional se build local)
└── backend/                # (opcional se build local)
```

### Variáveis de Ambiente no Servidor
Certifique-se de que `.env` no servidor contém:
```
JWT_SECRET=seu_jwt_secret
DATABASE_URL=mysql://user:pass@host:3306/db
# ... outras variáveis
```

## 🚀 Fluxo de Deploy

### Push para `main`
1. CI executa (tests, lint, build)
2. Se CI passar, CD dispara automaticamente
3. Docker images são buildadas e pushadas para GHCR
4. Deploy SSH ocorre no servidor
5. Smoke tests verificam endpoints críticos
6. Notificação Slack é enviada (sucesso ou falha)
7. Rollback automático se smoke tests falharem

### Criar Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 📊 Smoke Tests

Os smoke tests verificam automaticamente após deploy:
- ✅ Health check (`/health`)
- ✅ API documentation (`/api/docs`)
- ✅ OpenAPI schema (`/api/docs.json`)
- ✅ Auth endpoint (`/api/auth/me`)
- ✅ Database connectivity

Script: [.github/scripts/smoke-tests.sh](.github/scripts/smoke-tests.sh)

## 🔄 Rollback Automático

Se qualquer smoke test falhar:
1. Rollback automático é acionado
2. Servidor reverte para commit anterior
3. Services são redownloaded e reiniciados
4. Health check valida rollback
5. Notificação Slack alertará sobre a falha

## 🔍 Monitorar Workflows

- GitHub: `Actions` tab no repositório
- Slack: Mensagens no canal configurado
- Logs: Disponíveis no run da action no GitHub

## 🛠️ Troubleshooting

### Deploy falha com "Permission denied"
- Verifique se SSH_PRIVATE_KEY está completa (incluindo BEGIN/END)
- Certifique-se que chave pública está em `~/.ssh/authorized_keys` no servidor
- Teste SSH manual: `ssh -i ~/.ssh/github_actions usuario@servidor`

### Smoke tests falham
- Verifique se serviços iniciaram corretamente no servidor
- Logs: `docker compose logs -f`
- Teste manual: `curl http://localhost:3000/health`

### Slack webhook retorna erro
- Verifique URL está correta e completa
- Teste: `curl -X POST -H 'Content-type: application/json' --data '{"text":"Teste"}' YOUR_WEBHOOK_URL`

### Docker build falha em CI
- Verifique se `Dockerfile` está atualizado
- Certifique-se de que `package-lock.json` está commitado

## 📚 Referências

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [slackapi/slack-github-action](https://github.com/slackapi/slack-github-action)
- [Docker metadata-action](https://github.com/docker/metadata-action)
