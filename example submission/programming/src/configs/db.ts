import { Sequelize } from "sequelize";
import requireAll from 'require-all';
import path from "path";

export const sequelize : Sequelize = new Sequelize({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  define: {
    timestamps: false
  },
  logging: false
});

export const getSequelize = async() : Promise<Sequelize> => {
  try {

    const model = requireAll(({
      dirname: path.resolve(__dirname, "../models"),
      filter: /^(.+)\.model.ts$/,
      recursive: true,
    }))

    for await (const [k,v] of Object.entries(model)) {
      for (const key in v) if (typeof v[key] === 'function') v[key](sequelize);
    }

    await sequelize.authenticate();
    await sequelize.sync();
    // await sequelize.sync({ force : true });
    // console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  return sequelize;
}