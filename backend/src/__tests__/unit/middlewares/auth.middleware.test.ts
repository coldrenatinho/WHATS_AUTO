import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../../middlewares';
import { User } from '../../../models';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../../models', () => ({
  __esModule: true,
  User: {
    findByPk: jest.fn(),
  },
  Company: {},
}));

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

const createMockResponse = (): MockResponse => {
  const response = {} as MockResponse;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  it('deve retornar 401 quando nao houver bearer token', async () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token for invalido', async () => {
    const req = {
      headers: {
        authorization: 'Bearer token-invalido',
      },
    } as Request;

    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando usuario nao existir', async () => {
    const req = {
      headers: {
        authorization: 'Bearer token-valido',
      },
    } as Request;

    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    (jwt.verify as jest.Mock).mockReturnValue({ userId: 10, companyId: 2 });
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(User.findByPk).toHaveBeenCalledWith(10, {
      include: [{ model: expect.any(Object), as: 'company' }],
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado ou inativo' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve preencher req.user e req.company quando token for valido', async () => {
    const req = {
      headers: {
        authorization: 'Bearer token-valido',
      },
    } as Request;

    const res = createMockResponse();
    const next: NextFunction = jest.fn();

    const user = {
      id: 1,
      is_active: true,
      company: { id: 1, name: 'Empresa Teste' },
    };

    (jwt.verify as jest.Mock).mockReturnValue({ userId: 1, companyId: 1 });
    (User.findByPk as jest.Mock).mockResolvedValue(user);

    await authMiddleware(req, res, next);

    expect((req as Request & { user?: unknown }).user).toEqual(user);
    expect((req as Request & { company?: unknown }).company).toEqual(user.company);
    expect(next).toHaveBeenCalled();
  });
});
