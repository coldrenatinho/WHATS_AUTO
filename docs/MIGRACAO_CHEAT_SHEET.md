# 📌 Cartão de Referência Rápida - Migrações

## ⚡ Operações Comuns

### Verificar Status
```bash
npm run migrate:status
```
**Resultado:** Lista todas as migrações (executadas ✅ e pendentes ⏳)

### Executar Migrações Pendentes
```bash
# Automático no startup
npm run dev

# Ou manualmente
npm run migrate
```
**Resultado:** Todas as migrações pendentes são executadas

### Reverter Última Migração
```bash
npm run migrate:undo
```
**Resultado:** Desfaz a última migração (com down())

---

## 🆕 Criar Nova Migração

### 1. Copiar Template
```bash
cp src/migrations/TEMPLATE.ts src/migrations/TIMESTAMP-descricao.ts
```

### 2. Editar Arquivo
```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Implementar mudança no banco
  await queryInterface.addColumn('tabela', 'coluna', {
    type: DataTypes.STRING(50),
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Reverter mudança
  await queryInterface.removeColumn('tabela', 'coluna');
}
```

### 3. Testar
```bash
npm run dev           # Executa automaticamente
npm run migrate:status # Verifica
```

### 4. Commit
```bash
git add src/migrations/TIMESTAMP-descricao.ts
git commit -m "feat: descrição da mudança"
```

---

## 📋 Operações Comuns

| Operação | Comando | Resultado |
|----------|---------|-----------|
| Ver status | `npm run migrate:status` | Lista migrações |
| Executar | `npm run dev` ou `npm run migrate` | Roda pendentes |
| Reverter | `npm run migrate:undo` | Desfaz última |
| Criar | `cp TEMPLATE.ts TIMESTAMP-*.ts` | Nova migration |

---

## 🎯 Exemplos Rápidos

### Adicionar Coluna
```typescript
await queryInterface.addColumn('users', 'phone', {
  type: DataTypes.STRING(20),
  allowNull: true,
});
```

### Criar Tabela
```typescript
await queryInterface.createTable('products', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
});
```

### Criar Índice
```typescript
await queryInterface.addIndex('users', ['email']);
```

### Remover Coluna
```typescript
await queryInterface.removeColumn('users', 'phone');
```

---

## ⚠️ Boas Práticas

✅ **Faça:**
- Sempre implementar `down()`
- Use nomes descritivos
- Teste localmente primeiro
- Commit junto com o código

❌ **Evite:**
- Não omita `down()`
- Não misture múltiplas mudanças
- Não modifique migrations já executadas
- Não ignore erros de FK

---

## 📁 Estrutura

```
backend/src/migrations/
├── 20260413000001-create-bot-configs.ts       ✅ Já executada
├── 20260413000002-add-timezone-support.ts     ✅ Já executada
├── 20260414000001-your-new-change.ts          ⏳ Próxima
├── TEMPLATE.ts                                 📋 Copie este
├── cli.ts                                      ⚙️ CLI (não mexer)
├── runner.ts                                   ⚙️ Engine (não mexer)
└── index.ts                                    ⚙️ Exports (não mexer)
```

---

## 🔍 Troubleshooting

| Problema | Solução |
|----------|---------|
| Migration não executa | `npm run migrate` ou reinicie com `npm run dev` |
| Status mostra ??? | `npm run migrate:status` |
| Precisa reverter | `npm run migrate:undo` |
| Erro em down() | Verifique se implementou reverso correto |

---

## 🗂️ Tipos de Dados

```typescript
DataTypes.STRING(50)      // VARCHAR(50)
DataTypes.TEXT            // TEXT
DataTypes.INTEGER         // INT
DataTypes.DECIMAL(10, 2)  // DECIMAL(10, 2)
DataTypes.BOOLEAN         // BOOLEAN
DataTypes.DATE            // DATETIME
DataTypes.JSON            // JSON
```

---

## 📖 Documentação Completa

- [Guia Completo](migracao-banco-dados.md)
- [SQL vs Sequelize](sql-vs-migrations.md)
- [Início Rápido](MIGRACAO_RAPIDA.md)

---

**Última atualização:** 2026-04-13  
**Status:** ✅ Sistema operacional
