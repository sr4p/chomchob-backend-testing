import { DataTypes, Model, Sequelize } from 'sequelize';
export default (sequelize : Sequelize ) => {
  class Crypto extends Model {
    public id!: string;
    public name!: string;
    public symbol!: string;
    public price!: number;
    public supply!: number;
    public created_at!: Date;
    public updated_at!: Date;
  }

  Crypto.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    supply: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },{
    sequelize ,
    tableName: 'cryptocurrency',
    hooks: {
      beforeUpdate: (alias: Crypto) => {
        alias.updated_at = new Date();
      }
    }
  })

  return Crypto;
}