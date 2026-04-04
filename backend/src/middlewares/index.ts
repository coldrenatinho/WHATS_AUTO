import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Company } from '../models';
import logger from '../utils';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}

const createInMemoryRateLimit = ({
  windowMs,
  max,
  message,
  keyGenerator,
}: RateLimitOptions) => {
  const hits = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator?.(req) || req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      res.status(429).json({
        error: message,
      });
      return;
    }

    entry.count += 1;
    hits.set(key, entry);
    next();
  };
};

export const authRateLimit = createInMemoryRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Muitas tentativas. Tente novamente em alguns minutos.',
});

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
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET nao configurado');
      res.status(500).json({ error: 'Configuracao de autenticacao ausente' });
      return;
    }

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
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Erro nao tratado', error);

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