import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// ═══════════════════════════════════════════════════════════════
// Interface & Types
// ═══════════════════════════════════════════════════════════════

interface TicketAttributes {
  id: number;
  company_id: number;
  instance_id: number;
  user_id?: number;
  contact_phone: string;
  contact_name?: string;
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'whatsapp' | 'telegram' | 'messenger';
  tags?: string[];
  metadata?: Record<string, unknown>;
  last_message_at?: Date;
}

interface TicketCreationAttributes extends Optional<TicketAttributes, 'id' | 'status' | 'priority' | 'channel' | 'tags' | 'metadata' | 'last_message_at' | 'user_id' | 'contact_name'> {}

// ═══════════════════════════════════════════════════════════════
// Model Definition
// ═══════════════════════════════════════════════════════════════

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  declare id: number;
  declare company_id: number;
  declare instance_id: number;
  declare user_id?: number;
  declare contact_phone: string;
  declare contact_name?: string;
  declare status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  declare priority: 'low' | 'medium' | 'high' | 'urgent';
  declare channel: 'whatsapp' | 'telegram' | 'messenger';
  declare tags?: string[];
  declare metadata?: Record<string, unknown>;
  declare last_message_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare deleted_at?: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('open', 'pending', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    channel: {
      type: DataTypes.ENUM('whatsapp', 'telegram', 'messenger'),
      defaultValue: 'whatsapp',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tickets',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['company_id', 'status'] },
      { fields: ['instance_id'] },
      { fields: ['contact_phone'] },
    ],
  }
);

export default Ticket;