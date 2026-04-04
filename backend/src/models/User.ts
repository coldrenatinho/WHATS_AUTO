import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import type Company from './Company';

// ═══════════════════════════════════════════════════════════════
// Interface & Types
// ═══════════════════════════════════════════════════════════════

interface UserAttributes {
  id: number;
  company_id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'agent' | 'viewer';
  avatar?: string;
  is_active: boolean;
  last_login_at?: Date;
  settings?: Record<string, unknown>;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'avatar' | 'is_active' | 'settings'> {}

// ═══════════════════════════════════════════════════════════════
// Model Definition
// ═══════════════════════════════════════════════════════════════

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare company_id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: 'admin' | 'manager' | 'agent' | 'viewer';
  declare avatar?: string;
  declare is_active: boolean;
  declare last_login_at?: Date;
  declare settings?: Record<string, unknown>;
  declare company?: Company;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare deleted_at?: Date;

  // Métodos de instância
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'agent', 'viewer'),
      defaultValue: 'agent',
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
    indexes: [
      { unique: true, fields: ['email', 'company_id'] },
      { fields: ['company_id'] },
    ],
  }
);

export default User;