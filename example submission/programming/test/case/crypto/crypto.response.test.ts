import request from "supertest";
import { app } from "../../../src/app";

describe("Response : Crypto ", () => {
  const apiPart = "";
  const prefix = "/api/crypto";
  test(`returns with correct response @ POST ${apiPart}/${prefix}`, async () => {
    let symbol = (Math.random() + 1).toString(32).substring(9);
    return await request(app)
      .post(`${prefix}`)
      .auth(process.env.ADMIN_TOKEN + "", { type: "bearer" })
      .send({
        name: "Tonkla",
        symbol,
        price: Math.random() * 1000,
        supply: Math.floor(Math.random() * 10000),
      })
      .then((res) => {
        expect(res.statusCode).toEqual(201);
        expect(res.body).toMatchObject({});
      });
  });

  test(`returns with correct response @ GET ${apiPart}/${prefix}/balance`, async () => {
    return await request(app)
      .get(`${prefix}/balance`)
      .auth(process.env.ADMIN_TOKEN + "", { type: "bearer" })
      .then((res) => {
        const expectedProperties = {
          items: expect.arrayContaining(
            ((items) => {
              return items.map(() => {
                return expect.objectContaining({
                  crypto_id: expect.any(String),
                  crypto_name: expect.any(String),
                  crypto_symbol: expect.any(String),
                  crypto_volume: expect.any(String),
                  crypto_balance: expect.any(String),
                  crypto_supply: expect.any(String),
                  crypto_price: expect.any(String),
                  market_cap: expect.any(String),
                });
              });
            })(res.body.items)
          ),
        };

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(expectedProperties);
      });
  });

  test(`returns with correct response @ PUT ${apiPart}/${prefix}/exchange-rate/:id`, async () => {
    return await request(app)
      .put(`${prefix}/exchange-rate/36106ab5-8e1d-49eb-8bd1-04ac39444d1a`)
      .auth(process.env.ADMIN_TOKEN + "", { type: "bearer" })
      .send({
        price: Math.random() * 10000,
      })
      .then((res) => {
        const expectedProperties = expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          price: expect.any(String),
          supply: expect.any(String),
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(expectedProperties);
      });
  });
});
