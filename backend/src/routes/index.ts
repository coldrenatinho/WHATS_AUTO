import { Router } from 'express';
import authController from '../controllers';
import { authMiddleware } from '../middlewares';

// ═══════════════════════════════════════════════════════════════
// Rotas
// ═══════════════════════════════════════════════════════════════

const routes = Router();

// ─── Health Check ───────────────────────────────────────────────
routes.get('/health', (req, res) => {
  return res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── Rotas Públicas ─────────────────────────────────────────────
routes.post('/auth/login', authController.login.bind(authController));
routes.post('/auth/register', authController.register.bind(authController));

// ─── Rotas Protegidas ───────────────────────────────────────────
routes.use(authMiddleware);

// Auth
routes.get('/auth/me', authController.me.bind(authController));

// ─── Placeholder para futuras rotas ─────────────────────────────
// routes.use('/companies', companyRoutes);
// routes.use('/instances', instanceRoutes);
// routes.use('/tickets', ticketRoutes);
// routes.use('/messages', messageRoutes);
// routes.use('/webhooks', webhookRoutes);

export default routes;
