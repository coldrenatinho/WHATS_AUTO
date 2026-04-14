import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/**
 * Migração: [DESCRIÇÃO]
 * 
 * Data: [DATA]
 * Descrição: [O que esta mudança faz]
 * 
 * Exemplo de uso:
 * - Crie um novo arquivo em src/migrations/ com nome: YYYYMMDDHHMMSS-<description>.ts
 * - Implemente as funções up() e down()
 * - Execute: npm run migrate
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Implementar mudanças no banco aqui
  // Exemplo: criar tabela, adicionar coluna, criar índice, etc

  // Criar tabela
  // await queryInterface.createTable('table_name', {
  //   id: {
  //     type: DataTypes.INTEGER,
  //     autoIncrement: true,
  //     primaryKey: true,
  //   },
  //   name: {
  //     type: DataTypes.STRING(255),
  //     allowNull: false,
  //   },
  //   created_at: {
  //     type: DataTypes.DATE,
  //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  //   },
  // });

  // Adicionar coluna a uma tabela existente
  // await queryInterface.addColumn('table_name', 'new_column', {
  //   type: DataTypes.STRING(255),
  //   allowNull: true,
  // });

  // Criar índice
  // await queryInterface.addIndex('table_name', ['column_name']);

  console.log('✓ Migração executada com sucesso');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Reverter mudanças do up()
  // Importante: sempre implementar o reverso do up()

  // Remover tabela
  // await queryInterface.dropTable('table_name');

  // Remover coluna
  // await queryInterface.removeColumn('table_name', 'new_column');

  // Remover índice
  // await queryInterface.removeIndex('table_name', ['column_name']);

  console.log('✓ Migração desfeita com sucesso');
}

/**
 * Referência de Tipos de Dados (DataTypes):
 * - STRING(n): VARCHAR(n)
 * - TEXT: Texto longo
 * - INTEGER: Inteiro
 * - BIGINT: Inteiro grande
 * - BOOLEAN: Booleano
 * - DATE: Data e hora
 * - JSON: Dados JSON
 * - DECIMAL(10, 2): Decimal com precisão
 * - ENUM: Um de vários valores
 * - UUID: Identificador único
 * - VIRTUAL: Campo virtual/computado
 * 
 * Referência de Opções de Coluna:
 * - allowNull: Permite NULL
 * - defaultValue: Valor padrão
 * - autoIncrement: Auto incrementar (INTEGER PK)
 * - primaryKey: Chave primária
 * - unique: Valor único
 * - references: Chave estrangeira
 * - onUpdate: Ação ao atualizar FK (CASCADE, SET NULL, etc)
 * - onDelete: Ação ao deletar FK (CASCADE, SET NULL, etc)
 * - comment: Comentário da coluna
 * 
 * Referência de Métodos QueryInterface:
 * - createTable(tableName, attributes)
 * - dropTable(tableName)
 * - addColumn(tableName, columnName, attributes)
 * - removeColumn(tableName, columnName)
 * - renameColumn(tableName, attrNameBefore, attrNameAfter)
 * - changeColumn(tableName, attributeName, attributes)
 * - addIndex(tableName, fields, options)
 * - removeIndex(tableName, fields)
 * - addConstraint(tableName, options)
 * - removeConstraint(tableName, constraintName)
 * 
 * Exemplo de Migração Completa:
 * 
 * export async function up(queryInterface: QueryInterface): Promise<void> {
 *   // Criar tabela products
 *   await queryInterface.createTable('products', {
 *     id: {
 *       type: DataTypes.INTEGER,
 *       autoIncrement: true,
 *       primaryKey: true,
 *     },
 *     company_id: {
 *       type: DataTypes.INTEGER,
 *       allowNull: false,
 *       references: { model: 'companies', key: 'id' },
 *       onDelete: 'CASCADE',
 *     },
 *     name: {
 *       type: DataTypes.STRING(255),
 *       allowNull: false,
 *     },
 *     price: {
 *       type: DataTypes.DECIMAL(10, 2),
 *       allowNull: false,
 *     },
 *     active: {
 *       type: DataTypes.BOOLEAN,
 *       defaultValue: true,
 *     },\n *     created_at: {
 *       type: DataTypes.DATE,
 *       defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
 *     },\n *   });
 *   \n *   // Adicionar índices\n *   await queryInterface.addIndex('products', ['company_id']);\n *   await queryInterface.addIndex('products', ['active']);\n * }\n */
