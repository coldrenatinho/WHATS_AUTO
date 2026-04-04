import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// ═══════════════════════════════════════════════════════════════
// Interface & Types
// ═══════════════════════════════════════════════════════════════

interface InstanceAttributes {
  id: number;
  company_id: number;
  name: string;
  evolution_instance: string;
  phone?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
  webhook_url?: string;
  settings?: Record<string, unknown>;
  last_connected_at?: Date;
}

interface InstanceCreationAttributes extends Optional<InstanceAttributes, 'id' | 'status' | 'qr_code' | 'webhook_url' | 'settings' | 'last_connected_at'> {}

// ═══════════════════════════════════════════════════════════════
// Model Definition
// ═══════════════════════════════════════════════════════════════

class Instance extends Model<InstanceAttributes, InstanceCreationAttributes> implements InstanceAttributes {
  declare id: number;
  declare company_id: number;
  declare name: string;
  declare evolution_instance: string;
  declare phone?: string;
  declare status: 'connected' | 'disconnected' | 'connecting' | 'error';
  declare qr_code?: string;
  declare webhook_url?: string;
  declare settings?: Record<string, unknown>;
  declare last_connected_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare deleted_at?: Date;
}

Instance.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    evolution_instance: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('connected', 'disconnected', 'connecting', 'error'),
      defaultValue: 'disconnected',
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    webhook_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    last_connected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'instances',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['company_id'] },
      { fields: ['status'] },
    ],
  }
);

export default Instance;