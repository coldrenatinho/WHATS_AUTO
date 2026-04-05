# Guia de Workflows GitHub Actions

## 🔄 Workflows Disponíveis

### 1. CI (Integração Contínua)
**Arquivo:** `.github/workflows/ci.yml`
**Acionamento:** 
- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

**O que faz:**
- ✅ Lint de código (backend + frontend)
- ✅ Build (backend + frontend)
- ✅ Testes automatizados
- ✅ Validação de Docker images
- ✅ Validação de commit messages

**Resultado:**
- Falha no lint/build/testes bloqueia o PR
- Verde significa código pronto para merge

---

### 2. Pre-Deploy Validation
**Arquivo:** `.github/workflows/pre-deploy-validation.yml`
**Acionamento:** Manual via `Actions → Pre-Deploy Validation → Run workflow`

**Parâmetros:**
- **Ambiente Alvo:** staging | production
- **Componentes Afetados:** backend,frontend,database,webhooks (separados por vírgula)
- **Nível de Risco:** low | medium | high

**O que faz:**
- 🔍 Validação completa de backend (lint, build, testes, type-check)
- 🔍 Validação completa de frontend (lint, build, type-check)
- 🐳 Validação de Docker images
- 🔐 Audit de dependências
- 📋 Gera relatório de validação

**Quando usar:**
- Antes de fazer deploy para produção
- Para validar mudanças críticas de negócio
- Quando há dúvidas sobre impacto das mudanças

**Exemplo de uso:**
1. Faça commit e push no seu branch feature
2. Vá em `Actions → Pre-Deploy Validation → Run workflow`
3. Selecione:
   - `target_environment: production`
   - `affected_components: backend,database`
   - `risk_level: high`
4. Clique em `Run workflow`
5. Aguarde conclusão e verifique relatório

---

### 3. CD (Deploy Contínuo)
**Arquivo:** `.github/workflows/cd.yml`
**Acionamento:** Automático ao fazer push para `main`

**O que faz:**
- 🐳 Build Docker images (backend + frontend)
- 📤 Push para GitHub Container Registry (GHCR)
- 🚀 Deploy via SSH no servidor
- 🧪 Smoke tests nos endpoints críticos
- 💬 Notificação Slack (sucesso ou falha)
- 🔄 Rollback automático em caso de falha

**Fluxo:**
```
Push main → CI Pass → CD Build → Deploy → Smoke Tests → Slack Notify
                                       ↓
                              If Failure → Rollback
```

**Quando acontece:**
- Automático após cada merge para `main`
- Requer que CI (linting, build, testes) passe primeiro

---

### 4. Release
**Arquivo:** `.github/workflows/release.yml`
**Acionamento:** Ao criar tag com padrão `v*` (ex: `v1.0.0`)

**O que faz:**
- 📝 Gera changelog automático
- 📦 Cria GitHub Release
- 📋 Documenta Docker images publicadas

**Como usar:**
```bash
# Criar tag (local)
git tag v1.2.3

# Push para GitHub
git push origin v1.2.3
```

---

## 🎯 Cenários Comuns

### Cenário 1: Desenvolvimento local
```bash
# 1. Crie branch feature
git checkout -b feature/meu-recurso

# 2. Faça commits (com mensagens convencionais)
git commit -m "feat(auth): adiciona 2FA"

# 3. Push e abra PR
git push origin feature/meu-recurso

# 4. CI roda automaticamente
# → Verifique status em Actions

# 5. Após aprovação, merge para develop
# CI passa, status verde
```

### Cenário 2: Validação antes de deploy crítico
```bash
# 1. Faça merge para develop
# 2. Teste localmente
git checkout develop && npm run dev

# 3. Crie PR para main
# 4. Após aprovação, faça merge
# 5. ANTES de deploy, rode validação manual:
#    Actions → Pre-Deploy Validation
#    target_environment: production
#    affected_components: backend,database
#    risk_level: high

# 6. Se passar, faça push para main
git push origin develop:main

# 7. CD dispara automaticamente
# → Acompanhe em Slack
```

### Cenário 3: Deploy com rollback
```bash
# 1. Merge em main
git push origin main

# 2. CD inicia automaticamente
# 3. Smoke tests rodam
# 4. Se OK → Deploy confirmado, Slack notifica ✅
# 5. Se falha → Rollback automático, Slack alerta ❌

# 6. (Se necessário rollback manual)
ssh usuario@servidor
cd /opt/whatsauto
git log --oneline  # Ver commits anteriores
git checkout <commit-anterior>
docker compose up -d --remove-orphans
```

### Cenário 4: Hotfix para produção
```bash
# 1. Crie branch do main
git checkout -b hotfix/critical-bug main

# 2. Faça fix
vim backend/src/something.ts
git commit -m "fix(critical): resolve XYZ"

# 3. PR → main
git push origin hotfix/critical-bug

# 4. Approve rápidamente
# 5. Merge → CD dispara

# 6. Crie tag de release
git tag v1.0.1
git push origin v1.0.1
```

---

## 📊 Monitoramento

### GitHub Actions tab
- Visualize execução de todos os workflows
- Veja logs de cada step
- Reteste se necessário

### Slack
- Notificações de sucesso em verde ✅
- Notificações de falha em vermelho ❌
- Links diretos para aplicação e logs

### Servidor
```bash
ssh usuario@servidor
cd /opt/whatsauto

# Ver status dos containers
docker compose ps

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Health check manual
curl http://localhost:3000/health
```

---

## 🔧 Troubleshooting

### "Action failed" no CI
**Causa:** Falha em lint, build ou testes
**Solução:**
1. Clique no run do GitHub Actions
2. Veja qual step falhou
3. Teste localmente:
   ```bash
   cd backend && npm run lint
   cd frontend && npm run build
   ```
4. Corrija e faça novo push

### "Permission denied" no Deploy
**Causa:** SSH key incorreta ou não configurada
**Solução:**
1. Verifique secret `SSH_PRIVATE_KEY` no GitHub
2. Teste SSH local: `ssh -i ~/.ssh/github_actions usuario@servidor`
3. Releia [DEPLOYMENT.md](DEPLOYMENT.md) seção "SSH Keys"

### Smoke tests falham pós-deploy
**Causa:** Serviço não iniciou corretamente
**Solução:**
1. Webhook Slack avisa sobre falha
2. Rollback automático foi acionado
3. Verifique logs no servidor:
   ```bash
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

### Docker build falha em CI
**Causa:** `package-lock.json` fora de sync
**Solução:**
```bash
# No seu PC local
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "chore: update package-lock"
git push
```

---

## 📚 Comandos Úteis

```bash
# Ver último status de todos os workflows
gh run list --limit 10

# Ver logs de um run específico
gh run view <RUN_ID> --log

# Reteste um workflow falho
gh run rerun <RUN_ID>

# Cancelar um run em andamento
gh run cancel <RUN_ID>
```

---

## 🔐 Variáveis de Ambiente

### CI/CD Requerem
- `.env` local com variáveis de teste
- `docker-compose.yml` funcional
- Node.js 20+

### Secrets No GitHub
Veja [DEPLOYMENT.md](DEPLOYMENT.md) para detalhes

---

## 📞 Suporte

Para dúvidas:
1. Verifique os logs do GitHub Actions
2. Consulte [DEPLOYMENT.md](DEPLOYMENT.md)
3. Teste localmente antes de consultar
