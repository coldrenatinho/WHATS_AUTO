import dotenv from 'dotenv';
import sequelize from '../config/database';
import MigrationRunner from './runner';

dotenv.config();

const args = process.argv.slice(2);
const command = args[0] || 'run';

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conectado ao banco de dados');

    const runner = new MigrationRunner(sequelize);

    switch (command) {
      case 'run':
        console.log('Running migrations...');
        await runner.runPendingMigrations();
        break;

      case 'status':
        await runner.listMigrationStatus();
        break;

      case 'undo':
        console.log('Rolling back last migration...');
        await runner.rollbackLastMigration();
        break;

      default:
        console.log('Comandos disponíveis:');
        console.log('  npm run migrate                  # Executar migrações pendentes');
        console.log('  npm run migrate:status            # Ver status das migrações');
        console.log('  npm run migrate:undo              # Reverter última migração');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

main();
