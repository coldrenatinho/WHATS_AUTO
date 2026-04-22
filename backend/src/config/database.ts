import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsauto',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mariadb',
    logging: logger.isSqlLoggingEnabled()
      ? (sql, timing) => {
          logger.debug('SQL', { sql, timing });
        }
      : false,
    dialectOptions: {
      connectTimeout: 60000,
      multipleStatements: true, // Optimizes execution of queries
    },
    pool: {
      max: 20,         // Máximo de conexões (aumentado para suportar picos de login/mensagens)
      min: 5,          // Mantém pelo menos 5 conexões ativas
      acquire: 60000,  // Tempo máximo para tentar adquirir uma conexão antes de falhar
      idle: 10000,     // Se uma conexão ficar ociosa por 10s, ela é liberada
    },
    retry: {
      match: [/Deadlock/i, /SequelizeConnectionError/i, /SequelizeConnectionRefusedError/i, /SequelizeHostNotFoundError/i, /SequelizeHostNotReachableError/i, /SequelizeInvalidConnectionError/i, /SequelizeConnectionTimedOutError/i],
      max: 3 // Retry queries up to 3 times for transient failures
    }
  }
);

export default sequelize;
