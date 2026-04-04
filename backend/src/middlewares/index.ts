import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Company } from '../models';

// ═══════════════════════════════════════════════════════════════
// Tipos
// ═══════════════════════════════════════════════════════════════

export interface AuthRequest extends Request {
  user?: User;
  company?: Company;
}

interface JwtPayload {
  userId: number;
  companyId: number;
}

// ═══════════════════════════════════════════════════════════════
// Middleware de Autenticação
// ═══════════════════════════════════════════════════════════════

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default_secret';

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Company, as: 'company' }],
    });

    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      return;
    }

    req.user = user;
    req.company = user.company;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ═══════════════════════════════════════════════════════════════
// Middleware de Autorização por Role
// ═══════════════════════════════════════════════════════════════

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    next();
  };
};

// ═══════════════════════════════════════════════════════════════
// Middleware de Tratamento de Erros
// ═══════════════════════════════════════════════════════════════

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

export default {
  authMiddleware,
  roleMiddleware,
  errorHandler,
};