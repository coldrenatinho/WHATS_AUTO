import sequelize from '../config/database';
import Company from './Company';
import User from './User';
import Instance from './Instance';
import Ticket from './Ticket';
import Message from './Message';
import Flow from './Flow';

// ═══════════════════════════════════════════════════════════════
// Associações entre Models
// ═══════════════════════════════════════════════════════════════

// Company -> Users (1:N)
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Company -> Instances (1:N)
Company.hasMany(Instance, { foreignKey: 'company_id', as: 'instances' });
Instance.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Company -> Tickets (1:N)
Company.hasMany(Ticket, { foreignKey: 'company_id', as: 'tickets' });
Ticket.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Instance -> Tickets (1:N)
Instance.hasMany(Ticket, { foreignKey: 'instance_id', as: 'tickets' });
Ticket.belongsTo(Instance, { foreignKey: 'instance_id', as: 'instance' });

// User -> Tickets (1:N - assigned agent)
User.hasMany(Ticket, { foreignKey: 'user_id', as: 'assigned_tickets' });
Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'agent' });

// Ticket -> Messages (1:N)
Ticket.hasMany(Message, { foreignKey: 'ticket_id', as: 'messages' });
Message.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

// Instance -> Messages (1:N)
Instance.hasMany(Message, { foreignKey: 'instance_id', as: 'messages' });
Message.belongsTo(Instance, { foreignKey: 'instance_id', as: 'instance' });

// Company -> Messages (1:N)
Company.hasMany(Message, { foreignKey: 'company_id', as: 'messages' });
Message.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Company -> Flows (1:N)
Company.hasMany(Flow, { foreignKey: 'company_id', as: 'flows' });
Flow.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

export {
  sequelize,
  Company,
  User,
  Instance,
  Ticket,
  Message,
  Flow
};

export default {
  sequelize,
  Company,
  User,
  Instance,
  Ticket,
  Message,
  Flow
};