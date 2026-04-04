import { Router } from 'express';
import authController from '../controllers';
import managementController from '../controllers/management.controller';
import revolutionController from '../controllers/revolution.controller';
import { authMiddleware, authRateLimit, roleMiddleware } from '../middlewares';

// ═══════════════════════════════════════════════════════════════
// Rotas
// ═══════════════════════════════════════════════════════════════

const routes = Router();

// ─── Health Check ───────────────────────────────────────────────
routes.get('/health', (_req, res) => {
  return res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── Rotas Públicas ─────────────────────────────────────────────
routes.use('/auth', authRateLimit);
routes.post('/auth/login', authController.login.bind(authController));
routes.post('/auth/register', authController.register.bind(authController));

// ─── Rotas Protegidas ───────────────────────────────────────────
routes.use(authMiddleware);

// Auth
routes.get('/auth/me', authController.me.bind(authController));

// Dashboard
routes.get('/dashboard/summary', managementController.dashboard.bind(managementController));

// Conversas (area do usuario/agente)
routes.get('/tickets', managementController.listTickets.bind(managementController));
routes.post('/tickets', managementController.createTicket.bind(managementController));
routes.patch('/tickets/:id', managementController.updateTicket.bind(managementController));

// Fluxos
routes.get('/flows', managementController.listFlows.bind(managementController));
routes.post('/flows', roleMiddleware('admin', 'manager'), managementController.createFlow.bind(managementController));
routes.patch('/flows/:id', roleMiddleware('admin', 'manager'), managementController.updateFlow.bind(managementController));

// Admin: usuarios/agentes
routes.get('/users', roleMiddleware('admin', 'manager'), managementController.listUsers.bind(managementController));
routes.post('/users', roleMiddleware('admin'), managementController.createUser.bind(managementController));
routes.patch('/users/:id', roleMiddleware('admin'), managementController.updateUser.bind(managementController));

// Admin: numeros/instancias
routes.get('/instances', roleMiddleware('admin', 'manager', 'agent', 'viewer'), managementController.listInstances.bind(managementController));
routes.post('/instances', roleMiddleware('admin', 'manager'), managementController.createInstance.bind(managementController));
routes.patch('/instances/:id', roleMiddleware('admin', 'manager'), managementController.updateInstance.bind(managementController));
routes.post('/instances/:id/connect', roleMiddleware('admin', 'manager'), managementController.connectInstance.bind(managementController));

// Revolution API (mock)
routes.get('/revolution/instances', roleMiddleware('admin', 'manager', 'agent', 'viewer'), revolutionController.listInstances.bind(revolutionController));
routes.post('/revolution/instances', roleMiddleware('admin', 'manager'), revolutionController.createInstance.bind(revolutionController));
routes.post('/revolution/instances/:instanceName/connect', roleMiddleware('admin', 'manager'), revolutionController.connectInstance.bind(revolutionController));
routes.post('/revolution/instances/:instanceName/disconnect', roleMiddleware('admin', 'manager'), revolutionController.disconnectInstance.bind(revolutionController));
routes.get('/revolution/instances/:instanceName/status', roleMiddleware('admin', 'manager', 'agent', 'viewer'), revolutionController.getStatus.bind(revolutionController));
routes.get('/revolution/instances/:instanceName/qrcode', roleMiddleware('admin', 'manager', 'agent', 'viewer'), revolutionController.getQrCode.bind(revolutionController));
routes.post('/revolution/messages/text', roleMiddleware('admin', 'manager', 'agent'), revolutionController.sendTextMessage.bind(revolutionController));

// ─── Placeholder para futuras rotas ─────────────────────────────
// routes.use('/companies', companyRoutes);
// routes.use('/messages', messageRoutes);
// routes.use('/webhooks', webhookRoutes);

export default routes;
