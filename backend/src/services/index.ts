import jwt from 'jsonwebtoken';
import { User, Company, sequelize } from '../models';
import { AuthRequest } from '../middlewares';

// ═══════════════════════════════════════════════════════════════
// Auth Service
// ═══════════════════════════════════════════════════════════════

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  subdomain: string;
  phone?: string;
}

class AuthService {
  async login(data: LoginData) {
    const user = await User.findOne({
      where: { email: data.email },
      include: [{ model: Company, as: 'company' }],
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    const isValidPassword = await user.validatePassword(data.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Atualiza último login
    await user.update({ last_login_at: new Date() });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      company: user.company,
      token,
    };
  }

  async register(data: RegisterData) {
    const transaction = await sequelize.transaction();

    try {
      // Verifica se subdomain já existe
      const existingCompany = await Company.findOne({
        where: { subdomain: data.subdomain },
        transaction,
      });

      if (existingCompany) {
        throw new Error('Subdomínio já está em uso');
      }

      // Verifica se email já existe
      const existingUser = await User.findOne({
        where: { email: data.email },
        transaction,
      });

      if (existingUser) {
        throw new Error('Email já está cadastrado');
      }

      // Cria empresa
      const company = await Company.create(
        {
          name: data.companyName,
          subdomain: data.subdomain,
          email: data.email,
          phone: data.phone,
          status: 'trial',
          plan: 'basic',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        },
        { transaction }
      );

      // Cria usuário admin
      const user = await User.create(
        {
          company_id: company.id,
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'admin',
        },
        { transaction }
      );

      await transaction.commit();

      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        company,
        token,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jwt.sign(
      { userId: user.id, companyId: user.company_id },
      secret,
      { expiresIn: '7d' }
    );
  }
}

export default new AuthService();