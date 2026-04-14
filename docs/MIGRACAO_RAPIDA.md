# 🚀 Guia Rápido - Migrações (Saindo de SQL Puro)

## Antes: SQL Puro ❌

```bash
# Você tinha que fazer isso manualmente:
mysql -u user -p database < infrastructure/migrations/001_create_bot_configs.sql

# Problema:
# - Sem histórico de execução
# - Sem rollback automático
# - Difícil em produção
# - Conflitos em time
```

## Depois: Sequelize Migrations ✅

```bash
# Tudo automático no startup:
npm run dev

# ✅ Migrações executadas automaticamente
# ✅ Status rastreável
# ✅ Rollback simples: npm run migrate:undo
```

## O Que Mudou

### Estrutura
```diff
- infrastructure/migrations/001_create_bot_configs.sql
+ backend/src/migrations/20260413000001-create-bot-configs.ts
```

### Execução
```diff
- Manual via terminal
+ Automática no startup (ou npm run migrate)
```

### Rastreamento
```diff
- Você não sabia se foi executada
+ npm run migrate:status mostra tudo
```

## Seu Primeiro Comando

```bash
# 1. Abra o terminal na pasta backend
cd backend

# 2. Veja o status
npm run migrate:status

# Output esperado:
# 📋 Status das Migrações:
# ════════════════════════════════════════════════════════════════
# ✅ 20260413000001-create-bot-configs.ts
# ✅ 20260413000002-add-timezone-support.ts
# ════════════════════════════════════════════════════════════════
# Total: 2 | Executadas: 2 | Pendentes: 0

# 3. Pronto! Tudo já foi executado quando você fez npm run dev
```

## Criar Nova Migração (Próxima Vez)

```bash
# 1. Gere um timestamp
date +"%Y%m%d%H%M%S"
# 20260413140530

# 2. Crie o arquivo
cp src/migrations/TEMPLATE.ts src/migrations/20260413140530-add-user-phone.ts

# 3. Edite o arquivo
# Implemente a função up() e down()

# 4. Teste
npm run dev
npm run migrate:status

# 5. Commit
git add src/migrations/20260413140530-add-user-phone.ts
git commit -m "feat: add phone to users"
```

## Precisa Reverter Algo?

```bash
# Reverter última migração
npm run migrate:undo

# Verificar status
npm run migrate:status

# Executar novamente
npm run migrate
```

## Tabelas Afetadas

Você não precisa fazer nada! As migrações já foram aplicadas no banco:

- ✅ `bot_configs` - Nova tabela criada
- ✅ `sequelizemeta` - Histórico de migrações (criado automaticamente)

## Remover SQL Antigo

Você pode deletar o arquivo SQL antigo:

```bash
# Antes
infrastructure/migrations/001_create_bot_configs.sql

# Depois (seguro para deletar)
rm infrastructure/migrations/001_create_bot_configs.sql
```

## Próximas Mudanças no Banco

Nunca mais SQL manual! Sempre use migrações:

```typescript
// ✅ Correto: Nova migração
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('users', 'timezone', {
    type: DataTypes.STRING(50),
  });
}

// ❌ Errado: SQL manual
// mysql -u user -p db -e "ALTER TABLE users ADD COLUMN timezone VARCHAR(50);"
```

## Onde Estão as Migrações?

```
backend/
src/
  migrations/
  ├── 20260413000001-create-bot-configs.ts      ← Migrate da tabela bot_configs
  ├── 20260413000002-add-timezone-support.ts    ← Próxima migração
  ├── TEMPLATE.ts                                ← Copie para criar nova
  ├── cli.ts                                     ← Interface en línea de comandos
  ├── runner.ts                                  ← Engine (não mexer)
  └── index.ts                                   ← Exportações (não mexer)
```

## Documentação Completa

Ver todos os detalhes em:
- [📖 Guia de Migrações](./migracao-banco-dados.md)
- [📊 SQL vs Sequelize](./sql-vs-migrations.md)

## FAQ Rápido

**P: Preciso fazer algo no banco?**  
R: Não! Tudo aconteceu automaticamente.

**P: Como saber se funcionou?**  
R: `npm run migrate:status`

**P: Precisei reverter. O que faço?**  
R: `npm run migrate:undo`

**P: Posso deletar o arquivo SQL antigo?**  
R: Sim! A migração já foi executada.

**P: E se precisar criar outra mudança?**  
R: `cp src/migrations/TEMPLATE.ts src/migrations/TIMESTAMP-descricao.ts`

---

**Status**: ✅ Configurado e Pronto  
**Último update**: 2026-04-13  
**Migrações executadas**: 2
