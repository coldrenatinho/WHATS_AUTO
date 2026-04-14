import sequelize from '../config/database';
import MigrationRunner from './runner';

/**
 * Executar migrações automaticamente no startup da aplicação
 * Chamado no app.ts antes de inicializar o servidor
 */
export async function runMigrations(): Promise<void> {
  try {
    const runner = new MigrationRunner(sequelize);
    await runner.runPendingMigrations();
  } catch (error) {
    console.error('Falha crítica ao executar migrações:', error);
    process.exit(1);
  }
}

/**
 * Reverter última migração (usar com cuidado)
 */
export async function rollbackMigration(): Promise<void> {
  try {
    const runner = new MigrationRunner(sequelize);
    await runner.rollbackLastMigration();
  } catch (error) {
    console.error('Erro ao reverter migração:', error);
    process.exit(1);
  }
}

/**
 * Listar status de todas as migrações
 */
export async function listMigrations(): Promise<void> {
  try {
    const runner = new MigrationRunner(sequelize);
    await runner.listMigrationStatus();
  } catch (error) {
    console.error('Erro ao listar migrações:', error);
    process.exit(1);
  }
}
