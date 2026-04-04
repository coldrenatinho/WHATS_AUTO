import { Request, Response } from 'express';
import authService from '../services';
import { AuthRequest } from '../middlewares';

// ═══════════════════════════════════════════════════════════════
// Auth Controller
// ═══════════════════════════════════════════════════════════════

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email e senha são obrigatórios' });
        return;
      }

      const result = await authService.login({ email, password });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no login';
      res.status(401).json({ error: message });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, companyName, subdomain, phone } = req.body;

      if (!name || !email || !password || !companyName || !subdomain) {
        res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        return;
      }

      const result = await authService.register({
        name,
        email,
        password,
        companyName,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9]/g, ''),
        phone,
      });

      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no registro';
      res.status(400).json({ error: message });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.json({
        user: {
          id: req.user?.id,
          name: req.user?.name,
          email: req.user?.email,
          role: req.user?.role,
          avatar: req.user?.avatar,
        },
        company: req.company,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
  }
}

export default new AuthController();