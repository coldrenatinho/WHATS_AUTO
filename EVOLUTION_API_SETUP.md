# Evolution API - Setup e Troubleshooting

## Status Atual
- ✅ **Backend, Frontend, MariaDB, PostgreSQL, Redis:** Todos operacionais
- ⏸️ **Evolution API:** Removido (requer configuração adicional)

## Por Que Evolution Falha

Evolution tenta executar migrações Prisma no startup usando a variável `DATABASE_CONNECTION_URI`. O erro observado foi:

```
Error: P1000: Authentication failed against database server at `postgres`, 
the provided database credentials for `botuser` are not valid.
```

**Causa Raiz:** A variável `DATABASE_CONNECTION_URI` não estava sendo corretamente expandida pelo script de inicialização do Evolution.

## Como Reativar Evolution

### 1. Verificar Credenciais PostgreSQL

```bash
# Dentro do container postgres
docker compose exec -T postgres psql -U botuser -d evolution_db -c "SELECT 1;"
```

Esperado: `1` (uma linha com valor 1)

### 2. Atualizar docker-compose.yml

Descomente o serviço `evolution`:

```yaml
  evolution:
    image: atendai/evolution-api:latest
    container_name: evolution_api
    restart: unless-stopped
    environment:
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      # ... resto das variáveis
```

### 3. Iniciar Evolution

```bash
docker compose up -d evolution
```

### 4. Monitorar Logs

```bash
docker compose logs -f evolution
```

Procure por:
- `Migration deployed successfully` (sucesso)
- `Error: P1000` (falha de autenticação)
- `Evolution API running on` (API operacional)

## Variáveis de Ambiente Críticas

```env
# PostgreSQL
POSTGRES_USER=botuser
POSTGRES_PASSWORD=BotSenha123456
POSTGRES_DB=evolution_db

# Evolution
EVOLUTION_SERVER_URL=https://evolution.nortemtsistemas.com.br
EVOLUTION_API_KEY=seu_api_key_aqui
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://botuser:BotSenha123456@postgres:5432/evolution_db
```

## Troubleshooting

### Evolution continua em restart
1. Verifique se PostgreSQL está saudável: `docker compose ps postgres`
2. Teste conexão: `docker compose exec -T postgres psql -U botuser -d evolution_db -c "SELECT 1;"`
3. Verifique logs: `docker compose logs evolution --tail 50`

### Erro de senha PostgreSQL
- Altere senha no banco: 
  ```bash
  docker compose exec -T postgres psql -U botuser -d evolution_db \
    -c "ALTER USER botuser WITH PASSWORD 'nova_senha';"
  ```
- Atualize `.env` com a nova senha
- Restart Evolution

### Migrações falham
- Limpe migrations:
  ```bash
  docker volume rm whatsauto_evolution_data
  docker compose up -d evolution
  ```

## Próximos Passos

1. **Resolver autenticação PostgreSQL**
   - Confirmar que credenciais em `.env` correspondem ao banco

2. **Testar migrações Prisma**
   - Verificar se schema de Evolution é criado
   - Executar: `docker compose logs evolution | grep -i migration`

3. **Configurar Webhooks**
   - Evolution enviará eventos de WhatsApp para Backend
   - Backend precisa de rota para receber: `/webhook/evolution`

4. **Testar Conectividade**
   - Acessar: `https://evolution.nortemtsistemas.com.br`
   - Verificar se está respondendo na porta 8080
