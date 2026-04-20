import { Company, Instance, User, sequelize } from '../models';
import logger from '../utils';
import { runMigrations } from '../migrations';

interface BootstrapResult {
  companyId: number;
  adminUserId: number;
  instanceId: number;
}

const normalizeSubdomain = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

class BootstrapService {
  async run(): Promise<BootstrapResult> {
    logger.info('Iniciando bootstrap do banco');
    await sequelize.authenticate();

    // Executar migrações de banco de dados (se não desabilitado)
    const skipMigrations = process.env.SKIP_MIGRATIONS === 'true';
    if (!skipMigrations) {
      logger.info('Executando migrações pendentes...');
      await runMigrations();
    } else {
      logger.warn('⚠️  Migrações desabilitadas por SKIP_MIGRATIONS=true');
    }

    const businessName = process.env.BUSINESS_NAME || 'WhatsAuto';
    const subdomain = normalizeSubdomain(process.env.COMPANY_SUBDOMAIN || 'principal') || 'principal';
    const adminName = process.env.ADMIN_NAME || 'Administrador';
    const adminEmail = process.env.ADMIN_EMAIL || `admin@${subdomain}.local`;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD nao configurado para bootstrap');
    }
    const humanPhone = process.env.HUMAN_PHONE;

    const [company, companyCreated] = await Company.findOrCreate({
      where: { subdomain },
      defaults: {
        name: businessName,
        subdomain,
        email: adminEmail,
        phone: humanPhone,
        status: 'active',
        plan: 'professional',
        settings: {
          apiUrl: process.env.API_URL,
          evolutionServerUrl: process.env.EVOLUTION_SERVER_URL,
          n8nHost: process.env.N8N_HOST,
          webhookUrl: process.env.WEBHOOK_URL,
        },
      },
    });

    logger.info(companyCreated ? 'Empresa padrao criada' : 'Empresa padrao reutilizada', {
      companyId: company.id,
      subdomain: company.subdomain,
    });

    if (!company.settings) {
      await company.update({
        settings: {
          apiUrl: process.env.API_URL,
          evolutionServerUrl: process.env.EVOLUTION_SERVER_URL,
          n8nHost: process.env.N8N_HOST,
          webhookUrl: process.env.WEBHOOK_URL,
        },
      });
      logger.info('Configuracoes da empresa sincronizadas', { companyId: company.id });
    }

    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { company_id: company.id, email: adminEmail },
      defaults: {
        company_id: company.id,
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        is_active: true,
      },
    });

    logger.info(adminCreated ? 'Usuario admin criado' : 'Usuario admin reutilizado', {
      companyId: company.id,
      userId: adminUser.id,
      email: adminUser.email,
    });

    if (adminUser.role !== 'admin' || !adminUser.is_active) {
      await adminUser.update({ role: 'admin', is_active: true, name: adminName });
      logger.info('Usuario admin ajustado', {
        companyId: company.id,
        userId: adminUser.id,
      });
    }

    const shouldResetAdminPassword =
      adminUser.password === '$2a$10$YourHashedPasswordHere' || process.env.ADMIN_RESET_PASSWORD === 'true';

    if (shouldResetAdminPassword) {
      await adminUser.update({ password: adminPassword });
      logger.warn('Senha do admin redefinida durante bootstrap', {
        companyId: company.id,
        userId: adminUser.id,
      });
    }

    const evolutionInstance = process.env.EVOLUTION_INSTANCE || `${subdomain}-whatsapp`;

    const [instance, instanceCreated] = await Instance.findOrCreate({
      where: {
        company_id: company.id,
        evolution_instance: evolutionInstance,
      },
      defaults: {
        company_id: company.id,
        name: 'Numero Principal',
        evolution_instance: evolutionInstance,
        phone: humanPhone,
        status: 'disconnected',
        webhook_url: process.env.WEBHOOK_URL,
        settings: {
          evolutionApiKeyConfigured: Boolean(process.env.EVOLUTION_API_KEY),
        },
      },
    });

    logger.info(instanceCreated ? 'Instancia padrao criada' : 'Instancia padrao reutilizada', {
      companyId: company.id,
      instanceId: instance.id,
      evolutionInstance,
    });

    return {
      companyId: company.id,
      adminUserId: adminUser.id,
      instanceId: instance.id,
    };
  }
}

export default new BootstrapService();
