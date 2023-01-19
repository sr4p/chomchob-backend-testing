import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../configs/db";

const Item = sequelize.define("item", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  sale_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sale_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const Code = sequelize.define("code", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  discount: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
  },
  promotion_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  promotion_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const Bundle = sequelize.define("bundle", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "item",
      key: "id",
    },
  },
  code_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "code",
      key: "id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

const ItemCode = sequelize.define("item_code", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  code_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "code",
      key: "id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Item.hasMany(Bundle, { foreignKey: "item_id" });
Code.hasMany(Code, { foreignKey: "code_id" });
ItemCode.hasMany(Code, { foreignKey: "code_id" });

Bundle.belongsTo(Item, { foreignKey: "item_id" });
Bundle.belongsTo(Code, { foreignKey: "code_id" });
