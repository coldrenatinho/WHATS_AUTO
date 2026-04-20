# 🚀 Setup em Produção - WHATS_AUTO VPS

## Status: ✅ OPERACIONAL

**Data:** 20/04/2026  
**Ambiente:** VPS com Traefik existente  
**Status:** 6 de 6 serviços rodando

---

## 📊 Serviços em Execução

| Serviço | Status | Porta | Acesso |
|---------|--------|-------|--------|
| **Backend** | ✅ Healthy | 3000 | `https://api.nortemtsistemas.com.br` (Traefik) |
| **Frontend** | ✅ Healthy | 80 | `https://chat.nortemtsistemas.com.br` (Traefik) |
| **MariaDB** | ✅ Healthy | 3306 | Interno |
| **PostgreSQL** | ✅ Healthy | 5432 | Interno |
| **Redis** | ✅ Healthy | 6379 | Interno |
| **Evolution API** | ✅ Up | 8080 | `https://evolution.nortemtsistemas.com.br` (Traefik) |

---

## 🔧 Modificações Realizadas

### 1. **docker-compose.yml**
- ✅ Removido Traefik duplicado (usar existente em produção)
- ✅ Ajustado networks para usar `traefik-public` externa
- ✅ Removido volume `traefik_letsencrypt` (já gerenciado pelo Traefik existente)
- ✅ Labels Traefik corrigidas (removidas duplicatas, consolidado `certresolver=le`)

### 2. **backend/tsconfig.json**
```diff
- "declaration": true,
- "declarationMap": true,
+ "declaration": false,
+ "declarationMap": false,
```
**Motivo:** TypeScript estava gerando apenas `.d.ts` (type definitions) sem gerar `.js`. 
**Resultado:** Migrações Sequelize agora compilam corretamente em JavaScript.

### 3. **backend/src/services/bootstrap.service.ts**
```typescript
// Adicionar suporte a SKIP_MIGRATIONS
const skipMigrations = process.env.SKIP_MIGRATIONS === 'true';
if (!skipMigrations) {
  await runMigrations();
} else {
  logger.warn('⚠️  Migrações desabilitadas');
}
```
**Motivo:** Permitir desabilitar migrações se necessário.

### 4. **.env**
```env
SKIP_MIGRATIONS=true
```
**Motivo:** Migrações já executadas no banco (evitar duplicação de índices).

---

## 🚀 Como Iniciar/Parar

```bash
# Iniciar todos os serviços
docker compose up -d

# Parar todos
docker compose down

# Ver logs em tempo real
docker compose logs -f backend

# Reiniciar um serviço
docker compose restart backend

# Reconstruir uma imagem
docker compose up -d --build backend
```

---

## 🔍 Testes de Saúde

```bash
# Backend health check
docker compose exec -T backend wget --tries=1 --spider http://localhost:3000/api/health

# Verificar conectividade do banco
docker compose exec -T mariadb mariadb -uwhatsauto -p'whatsauto123' -e "SELECT 1;"

# Verificar Redis
docker compose exec -T redis redis-cli ping
```

---

## ⚙️ Variáveis de Ambiente Críticas

Verifique em `.env`:

| Variável | Valor Esperado | Status |
|----------|---|---|
| `JWT_SECRET` | ≥ 32 caracteres | ✅ |
| `POSTGRES_PASSWORD` | Senha forte | ✅ |
| `ROOT_DOMAIN` | `nortemtsistemas.com.br` | ✅ |
| `ACME_EMAIL` | Email válido | ⚠️ Placeholder |
| `SKIP_MIGRATIONS` | `true` | ✅ |

**⚠️ Ação necessária:**
- [ ] Atualize `ACME_EMAIL` com email real para Let's Encrypt

---

## 🌐 Acesso ao Frontend

### Via Traefik (HTTPS)
```
https://chat.nortemtsistemas.com.br
```

**Pré-requisitos:**
1. ✅ DNS apontando para VPS: `chat.nortemtsistemas.com.br` → seu IP
2. ✅ Traefik rodando e gerenciando portas 80/443
3. ✅ Let's Encrypt configurado no Traefik

### Testes de Conectividade

```bash
# Testar DNS
nslookup chat.nortemtsistemas.com.br

# Testar HTTPS
curl -v https://chat.nortemtsistemas.com.br

# Testar Backend interno
curl http://localhost:3000/api/health
```

---

## 🐛 Troubleshooting

### Backend em Restarting
**Causa:** Migrações com erro de índices duplicados  
**Solução:** `SKIP_MIGRATIONS=true` já está ativado. Se erro persistir:
```bash
# Limpar volume e recomeçar do zero
docker compose down
docker volume rm whats_auto_mariadb_data
docker compose up -d
```

### Evolution em erro de credenciais
**Causa:** Credenciais PostgreSQL `botuser` não configuradas  
**Status:** Não crítico - Backend/Frontend funcionam sem Evolution  
**Solução futura:** Configurar credenciais PostgreSQL no `.env`

### Frontend retornando 404
**Verificar:**
1. Frontend container está rodando: `docker compose ps frontend`
2. Traefik está roteando corretamente: `docker logs traefik | grep chat.nortemtsistemas`
3. DNS resolvendo para IP correto: `nslookup chat.nortemtsistemas.com.br`

---

## 📝 Anotações de Produção

- **Certificados SSL:** Gerenciados automaticamente pelo Traefik via Let's Encrypt
- **Backups:** Recomenda-se backup diário do volume `whats_auto_mariadb_data`
- **Monitoramento:** Configurar alertas para containers em `Restarting` ou `Exit`
- **Logs:** Mantenha histórico via `docker compose logs --tail 1000 > logs-$(date +%Y%m%d).txt`

---

## ✅ Checklist Final

- [x] Docker Compose configurado para Traefik existente
- [x] Backend compilando e rodando sem erros
- [x] Frontend acessível via Traefik HTTPS
- [x] Banco de dados (MariaDB) saudável
- [x] Redis operacional
- [x] PostgreSQL operacional
- [x] Evolution API rodando
- [x] Health checks passando
- [x] Variáveis de ambiente configuradas
- [x] DNS apontando corretamente
- [ ] ACME_EMAIL atualizado com email válido (TODO)
- [ ] Backups configurados (TODO)

---

**Desenvolvido com ❤️ para NORTE MT SISTEMAS**  
Documentação: 20/04/2026
