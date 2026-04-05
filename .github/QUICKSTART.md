# ⚡ Quickstart - Setup CI/CD

Siga este checklist para ativar a entrega contínua no seu repositório.

## ✅ Pré-requisitos

- [x] Repositório no GitHub com workflows em `.github/workflows/`
- [x] Docker instalado no seu servidor
- [x] Acesso SSH ao servidor de produção
- [x] Admin access ao repositório no GitHub

## 🔑 1. Configurar Secrets no GitHub

### 1.1 SSH Key (Deploy)

```bash
# No seu computador local
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""
ssh-copy-id -i ~/.ssh/github_actions.pub usuario@seu-servidor
cat ~/.ssh/github_actions
```

Copie e cole em:
**GitHub → Settings → Secrets and Variables → Actions → New Repository Secret**

```
Name:  SSH_PRIVATE_KEY
Value: (Cole chave completa: -----BEGIN RSA PRIVATE KEY----- até -----END RSA PRIVATE KEY-----)
```

### 1.2 Server Credentials

```
Name:  SERVER_HOST
Value: 123.45.67.89 (ou seu hostname)

Name:  SERVER_USER
Value: ubuntu (ou seu usuário SSH)
```

### 1.3 Slack Webhook

1. [Crie um Slack App](https://api.slack.com/apps)
2. Ative "Incoming Webhooks"
3. Crie webhook no seu canal
4. Copie URL e cole em:

```
Name:  SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/T00/B00/XXXX
```

## 🖥️ 2. Preparar Servidor

```bash
sudo mkdir -p /opt/whatsauto
sudo chown $USER:$USER /opt/whatsauto
cd /opt/whatsauto

# Clone ou copie docker-compose.yml
cp docker-compose.yml .

# Crie .env com variáveis (nunca commite!)
cat > .env << EOF
JWT_SECRET=seu-jwt-secret
DATABASE_URL=mysql://user:password@mysql:3306/whatsauto
# ... outras variáveis
EOF

# Pull inicial das imagens
docker compose pull
```

## 📝 3. Verificar Workflow Files

```bash
cd seu-repositorio

# Verificar se workflows existem
ls -la .github/workflows/
# Deve ter: ci.yml, cd.yml, release.yml, pre-deploy-validation.yml

# Verificar smoke test script
ls -la .github/scripts/
# Deve ter: smoke-tests.sh
```

## 🧪 4. Teste Local

```bash
# Simule o build Docker
docker build -t whatsauto-backend:test ./backend
docker build -t whatsauto-frontend:test ./frontend

# Teste o script de smoke tests (se tiver servidor local)
chmod +x .github/scripts/smoke-tests.sh
.github/scripts/smoke-tests.sh "http://localhost:3000"
```

## 🚀 5. Primeira Execução

### 5.1 Teste CI (Integração Contínua)

```bash
git checkout -b test/ci-setup
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify ci workflow"
git push origin test/ci-setup
```

Vá para **GitHub → Actions** e verifique se CI rodou:
- ✅ Backend lint, build, test
- ✅ Frontend lint, build
- ✅ Docker build test
- ✅ Commit lint

Se OK, delete branch:
```bash
git checkout main
git branch -D test/ci-setup
git push origin --delete test/ci-setup
```

### 5.2 Teste Pre-Deploy Validation

1. Vá em **GitHub → Actions**
2. Selecione **Pre-Deploy Validation**
3. Clique **Run workflow**
4. Deixe defaults e **Run workflow**
5. Verifique resultado (deve passar ✅)

### 5.3 Teste CD (Deploy) - OPCIONAL (requer merge em main)

```bash
git checkout main
git pull

# Faça uma pequena mudança (ex: versão)
echo "v1.0.0-test" > VERSION.txt
git add VERSION.txt
git commit -m "chore: test cd workflow"
git push origin main
```

Vá para **GitHub → Actions** e verifique CD:
- ✅ Build Docker images
- ✅ Push para GHCR
- ✅ Deploy via SSH
- ✅ Smoke tests
- ✅ Slack notification

(Se falhar, verifique secrets SSH)

## 🎯 6. Próximos Passos

- [ ] Configurar automação de deployment em staging primeiro
- [ ] Testar rollback automático
- [ ] Configurar alerts adicionais (email, PagerDuty, etc)
- [ ] Documentar runbook de incident response
- [ ] Treinar time sobre os workflows

## 📞 Troubleshooting Rápido

| Problema | Solução |
|---|---|
| SSH falha | Verifique `SSH_PRIVATE_KEY` secret e authorized_keys no servidor |
| Smoke tests falham | Verifique se API_URL está correta em `.github/workflows/cd.yml` |
| Slack não notifica | Verifique `SLACK_WEBHOOK_URL` secret |
| Docker push falha | GitHub Token é automático, verifique permissões do repo |
| Backend tests falham | `cd backend && npm test` local, fix e redeploy |

## 📚 Para mais detalhes

- [DEPLOYMENT.md](.github/DEPLOYMENT.md) - Setup detalhado
- [WORKFLOWS.md](.github/WORKFLOWS.md) - Guia completo de workflows
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Tempo estimado:** 30-45 minutos para setup completo.
**Tempo economizado:** Horas em deploys manuais! 🎉
