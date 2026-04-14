# 🔄 Sistema de Migrações de Banco de Dados

## Visão Geral

Este projeto usa **Sequelize Migrations** para gerenciar schema do banco de dados de forma profissional e rastreável.

Benefícios:
- ✅ Versionamento automático de mudanças
- ✅ Histórico completo de alterações
- ✅ Rollback seguro
- ✅ Colaboração sem conflitos
- ✅ Rastreamento de status
- ✅ Automação no startup

## Estrutura

```
backend/
├── src/migrations/
│   ├── 20260413000001-create-bot-configs.ts      # Migração principal
│   ├── 20260413000002-add-timezone-support.ts    # Migrations futuras
│   ├── TEMPLATE.ts                                # Template para novas migrações
│   ├── cli.ts                                     # Interface CLI
│   ├── runner.ts                                  # Engine de execução
│   └── index.ts                                   # Exportações
├── .sequelizerc                                   # Configuração Sequelize
└── package.json                                   # Scripts npm
```

## Como Usar

### ♻️ Executar Migrações Automaticamente

As migrações **rodam automaticamente** no startup:

```bash
npm run dev
# ✓ Conectado ao banco de dados
# 🔄 Iniciando migrações Sequelize...
#    └─ Executando: 20260413000001-create-bot-configs.ts
#    ✓ 20260413000001-create-bot-configs.ts concluída
# ✅ Todas as migrações foram executadas com sucesso
```

### 🔍 Ver Status das Migrações

```bash
npm run migrate:status

# 📋 Status das Migrações:
# ════════════════════════════════════════════════════════════════
# ✅ 20260413000001-create-bot-configs.ts
# ✅ 20260413000002-add-timezone-support.ts
# ════════════════════════════════════════════════════════════════
# Total: 2 | Executadas: 2 | Pendentes: 0
```

### 🔙 Reverter Última Migração

```bash
npm run migrate:undo

# Migração 20260413000002-add-timezone-support.ts revertida com sucesso
```

### ▶️ Executar Migrações Manualmente

```bash
npm run migrate

# 🔄 Iniciando migrações Sequelize...
# ✅ Todas as migrações estão atualizadas
```

## Criar Nova Migração

### Passo 1: Gerar Timestamp

```bash
# No terminal, obtenha o timestamp
date +"%Y%m%d%H%M%S"
# 20260413140530
```

### Passo 2: Criar Arquivo

Copie o template e crie um novo arquivo:

```bash
cp src/migrations/TEMPLATE.ts src/migrations/20260413140530-add-user-timezone.ts
```

### Passo 3: Implementar Migração

```typescript
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Adicionar coluna timezone à tabela bot_configs
  await queryInterface.addColumn('bot_configs', 'timezone', {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'America/Sao_Paulo',
    comment: 'Fuso horário do bot',
  });

  console.log('✓ Coluna timezone adicionada');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Reverter: remover coluna
  await queryInterface.removeColumn('bot_configs', 'timezone');
  console.log('✓ Coluna timezone removida');
}
```

### Passo 4: Testar Migração

```bash
# A migração roda automaticamente no próximo npm run dev
npm run dev

# Ou manualmente
npm run migrate
npm run migrate:status
```

## Exemplos de Operações Comuns

### Criar Nova Tabela

```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('audit_logs', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'companies', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  await queryInterface.addIndex('audit_logs', ['company_id']);
  await queryInterface.addIndex('audit_logs', ['user_id']);
  await queryInterface.addIndex('audit_logs', ['created_at']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('audit_logs');
}
```

### Adicionar Coluna com Restrição

```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('users', 'phone', {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('users', 'phone');
}
```

### Criar Índice Composto

```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addIndex('messages', ['ticket_id', 'created_at'], {
    name: 'idx_ticket_created',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('messages', 'idx_ticket_created');
}
```

### Renomear Coluna

```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.renameColumn('users', 'telefone', 'phone');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.renameColumn('users', 'phone', 'telefone');
}
```

### Alterar Tipo de Coluna

```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.changeColumn('messages', 'text', {
    type: DataTypes.TEXT,
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.changeColumn('messages', 'text', {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
}
```

## Tipos de Dados Disponíveis

```typescript
// Texto
DataTypes.STRING(50)      // VARCHAR(50)
DataTypes.TEXT            // TEXT
DataTypes.LONGTEXT        // LONGTEXT

// Números
DataTypes.INTEGER         // INT
DataTypes.BIGINT          // BIGINT
DataTypes.DECIMAL(10, 2)  // DECIMAL(10, 2)
DataTypes.FLOAT           // FLOAT

// Data/Hora
DataTypes.DATE            // DATETIME
DataTypes.TIME            // TIME
DataTypes.DATEONLY        // DATE

// Booleano
DataTypes.BOOLEAN         // TINYINT(1)

// JSON
DataTypes.JSON            // JSON
DataTypes.JSONB           // JSON (com validação)

// Especiais
DataTypes.UUID            // UUID
DataTypes.ENUM            // ENUM
DataTypes.GEOMETRY
```

## Opções de Coluna

```typescript
{
  type: DataTypes.STRING(255),
  allowNull: false,                    // NOT NULL
  defaultValue: 'value',               // DEFAULT 'value'
  defaultValue: 0,                     // DEFAULT 0
  defaultValue: () => new Date(),      // DEFAULT CURRENT_TIMESTAMP
  unique: true,                        // UNIQUE
  primaryKey: true,                    // PRIMARY KEY
  autoIncrement: true,                 // AUTO_INCREMENT
  comment: 'Descrição',               // COMMENT
  references: {                        // FOREIGN KEY
    model: 'companies',
    key: 'id'
  },
  onUpdate: 'CASCADE',                 // ON UPDATE CASCADE
  onDelete: 'SET NULL',                // ON DELETE SET NULL
  validate: {
    isEmail: true,
    len: [5, 50]
  }
}
```

## Opções de Restrição Física

```typescript
// Foreign Key actions
'CASCADE'         // Cascata de deletions
'SET NULL'        // Setar como NULL
'RESTRICT'        // Rejeitar operação
'NO ACTION'       // Sem ação (padrão)
'SET DEFAULT'     // Setar valor padrão
```

## Troubleshooting

### Erro: "Migração falhou"

1. Verifique se o banco está acessível
2. Revise a sintaxe TypeScript
3. Veja logs detalhados: `npm run migrate:status`

### Erro: "Foreign key constraint fails"

Certifique-se de que:
- A tabela referenciada existe
- O tipo de dado da coluna é compatível
- A coluna referenciada é PRIMARY KEY

### Rollback falhou

Se `npm run migrate:undo` falhar:
1. Verifique manualmente a função `down()`
2. Execute manualmente no banco se necessário
3. Limpe o registro em `sequelizemeta`

## Boas Práticas

✅ **Faça:**
- Sempre implementar função `down()` para rollback seguro
- Use nomes descritivos nos migrations
- Adicione comentários explicativos
- Crie índices para melhor performance
- Teste migrations localmente antes de commit

❌ **Não faça:**
- Não modifique migrations já executadas
- Não ignore erros de FK
- Não omita `down()` ou deixe vazio sem motivo
- Não misture múltiplas mudanças em uma migração
- Não esqueça de criar índices em FKs

## Integração com CI/CD

### GitHub Actions

```yaml
- name: Run migrations
  run: npm run migrate
  working-directory: backend
```

### Docker

```dockerfile
# Migrations rodam automaticamente no startup
CMD ["npm", "run", "dev"]
```

## Referência Rápida

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Roda migrações + inicia servidor |
| `npm run migrate` | Executa migrações pendentes |
| `npm run migrate:status` | Mostra status de todas |
| `npm run migrate:undo` | Reverte última migração |

## Mais Informações

- [Sequelize Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- `.sequelizerc` - Configuração do Sequelize
- `src/migrations/TEMPLATE.ts` - Template para novas migrações
- `src/migrations/runner.ts` - Engine de execução das migrações
