import { app } from './app';
import 'express-async-errors';
import { getSequelize } from "./configs/db";

const port: number = Number(process.env.NODE_PORT) || 9999;
app.listen(port,async () => {
  new Promise(async(resolve) => { 
    await getSequelize();
    console.log(`Listening on port : ${port} 🌱`);
    resolve(true)
  })
});
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});