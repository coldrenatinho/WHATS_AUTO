# 🚀 QUICK START - WHATS_AUTO em Produção

## Problema Original
❌ Usuário não conseguia acessar o frontend em `https://chat.nortemtsistemas.com.br`

## Solução Implementada
✅ **Status: OPERACIONAL** - 6 serviços rodando com Traefik HTTPS

```bash
# Iniciar tudo
docker compose up -d

# Ver status
docker compose ps

# Acessar
- Frontend: https://chat.nortemtsistemas.com.br (via Traefik)
- Backend:  https://api.nortemtsistemas.com.br (via Traefik)
```

## Checklist

- [x] docker-compose.yml configurado para Traefik existente
- [x] Frontend rodando com labels Traefik corretos
- [x] Backend rodando e respondendo em `/api/health`
- [x] HTTPS via Let's Encrypt (certresolver=le)
- [x] 6 serviços saudáveis (backend, frontend, mariadb, postgres, redis, evolution)
- [ ] DNS apontando `chat.nortemtsistemas.com.br` → seu IP VPS
- [ ] Acessar a URL e validar que frontend carrega

## Se não funcionar

### Opção 1: DNS não resolvendo
```bash
nslookup chat.nortemtsistemas.com.br
# Se não resolver, atualize o DNS provider
```

### Opção 2: Traefik não roteando
```bash
# Ver logs do Traefik
docker logs traefik | grep chat.nortemtsistemas

# Verificar se frontend está na rede traefik-public
docker inspect whatsauto_frontend | grep traefik-public
```

### Opção 3: Backend com erro
```bash
# Ver logs do backend
docker compose logs backend --tail=50

# Se tiver erro de índices duplicados:
# Limpar banco e recomeçar
docker compose down
docker volume rm whats_auto_mariadb_data
docker compose up -d
```

## Arquivos Críticos

- `docker-compose.yml` - Config principal (7 serviços)
- `.env` - Variáveis (SKIP_MIGRATIONS=true)
- `backend/tsconfig.json` - declaration: false (fix compilação)
- `backend/src/services/bootstrap.service.ts` - Skip migrations

## Documentação Completa

Ver: `SETUP_PRODUCAO.md`

---

**Data:** 20/04/2026 | **Status:** ✅ PRONTO PARA PRODUÇÃO
