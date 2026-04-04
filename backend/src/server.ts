import app from './app';
import http from 'http';
import dotenv from 'dotenv';
import bootstrapService from './services/bootstrap.service';
import logger from './utils';

dotenv.config();

const port = process.env.PORT || 3001;

const server = http.createServer(app);

const validateRequiredEnv = (): void => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET nao configurado');
	}
};

const startServer = async (): Promise<void> => {
  try {
    validateRequiredEnv();
    const bootstrap = await bootstrapService.run();

    server.listen(port, () => {
      logger.info('Servidor iniciado', { port });
      logger.info('Bootstrap concluido', bootstrap);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor', error);
    process.exit(1);
  }
};

void startServer();
