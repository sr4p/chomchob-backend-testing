import { getSequelize } from '../src/configs/db';
import { app } from './../src/app';
beforeAll(async () => {
  (<any>global).server = app.listen(Number(process.env.NODE_PORT), async ()=>{
    await getSequelize();
  })
});

afterAll(async () => {
  (<any>global).server.close()
});