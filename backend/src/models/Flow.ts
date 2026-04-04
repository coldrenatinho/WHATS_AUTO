import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FlowAttributes {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  trigger_type: 'keyword' | 'greeting' | 'menu' | 'webhook' | 'schedule';
  trigger_config?: Record<string, unknown>;
  n8n_workflow_id?: string;
  is_active: boolean;
  settings?: Record<string, unknown>;
}

interface FlowCreationAttributes extends Optional<FlowAttributes, 'id' | 'description' | 'trigger_type' | 'trigger_config' | 'n8n_workflow_id' | 'is_active' | 'settings'> {}

class Flow extends Model<FlowAttributes, FlowCreationAttributes> implements FlowAttributes {
  declare id: number;
  declare company_id: number;
  declare name: string;
  declare description?: string;
  declare trigger_type: 'keyword' | 'greeting' | 'menu' | 'webhook' | 'schedule';
  declare trigger_config?: Record<string, unknown>;
  declare n8n_workflow_id?: string;
  declare is_active: boolean;
  declare settings?: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare deleted_at?: Date;
}

Flow.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trigger_type: {
      type: DataTypes.ENUM('keyword', 'greeting', 'menu', 'webhook', 'schedule'),
      defaultValue: 'keyword',
    },
    trigger_config: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    n8n_workflow_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'flows',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['company_id'] },
      { fields: ['trigger_type'] },
      { fields: ['is_active'] },
    ],
  }
);

export default Flow;
