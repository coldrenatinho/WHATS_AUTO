import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// ═══════════════════════════════════════════════════════════════
// Interface & Types
// ═══════════════════════════════════════════════════════════════

interface MessageAttributes {
  id: number;
  company_id: number;
  ticket_id: number;
  instance_id: number;
  message_id?: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact';
  content?: string;
  media_url?: string;
  metadata?: Record<string, unknown>;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'message_id' | 'type' | 'content' | 'media_url' | 'metadata' | 'status' | 'sent_at' | 'delivered_at' | 'read_at'> {}

// ═══════════════════════════════════════════════════════════════
// Model Definition
// ═══════════════════════════════════════════════════════════════

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  declare id: number;
  declare company_id: number;
  declare ticket_id: number;
  declare instance_id: number;
  declare message_id?: string;
  declare direction: 'inbound' | 'outbound';
  declare type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact';
  declare content?: string;
  declare media_url?: string;
  declare metadata?: Record<string, unknown>;
  declare status: 'sent' | 'delivered' | 'read' | 'failed';
  declare sent_at?: Date;
  declare delivered_at?: Date;
  declare read_at?: Date;
  declare readonly created_at: Date;
}

Message.init(
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
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    direction: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact'),
      defaultValue: 'text',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
      defaultValue: 'sent',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['ticket_id', 'created_at'] },
      { fields: ['company_id', 'created_at'] },
      { fields: ['message_id'] },
    ],
  }
);

export default Message;