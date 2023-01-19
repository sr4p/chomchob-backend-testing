import { DataTypes, Model, Sequelize } from 'sequelize';
import { role } from '../controller/middleware';

export interface roleUser { id :string, address : string , role : role , username : string };

export default (sequelize : Sequelize ) => {
  class User extends Model {
    public id!: string;
    public address!: string;
    public name!: string;
    public username!: string;
    public password!: string;
    public role!: role;
    public created_at!: Date;
    public updated_at!: Date;
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    address: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM({
        values: [...Object.values(role)]
      }),
      defaultValue : role.user
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  },{
    sequelize ,
    tableName: 'users',
    hooks: {
      beforeUpdate: (alias: User) => {
        alias.updated_at = new Date();
      }
    }
  })

  return User;
}