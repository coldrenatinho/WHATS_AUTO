import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Adicionar coluna de fuso horário/timezone se precisar
  const tableExists = await queryInterface.tableExists('bot_configs');
  
  if (!tableExists) {
    console.log('Tabela bot_configs ainda não existe. Execute a migração anterior.');
    return;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Rollback se necessário
}
