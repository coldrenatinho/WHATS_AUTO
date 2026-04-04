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
    },
  }
);

export default sequelize;
