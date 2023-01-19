import request from "supertest";
import { app } from "../../../src/app";

jest.setTimeout(60000);

describe("Response : Wallet ", () => {
  beforeEach(async () => {});

  afterEach(async () => {});

  const apiPart = ``;
  const prefix = "/api/wallet";

  test(`returns with correct response @ POST ${apiPart}/${prefix}/balance`, async () => {
    return await request(app)
      .post(`${prefix}/balance`)
      .auth(process.env.ADMIN_TOKEN + "", { type: "bearer" })
      .send({
        address: "c8433dbf-88b2-41da-9516-d9852765d0e2",
        crypto_id: "36106ab5-8e1d-49eb-8bd1-04ac39444d1a",
        amount: 1,
      })
      .then((res) => {
        const expectedProperties = {
          data: expect.objectContaining({
            id: expect.any(String),
            address: expect.any(String),
            balance: expect.any(String),
            crypto_id: expect.any(String),
          }),
        };

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(expectedProperties);
      });
  });

  test(`returns with correct response @ POST ${apiPart}/${prefix}/transfer`, async () => {
    return await request(app)
      .post(`${prefix}/transfer`)
      .auth(process.env.USER_TOKEN + "", { type: "bearer" })
      .send({
        address_from: "c8433dbf-88b2-41da-9516-d9852765d0e2",
        address_to: "1c8ba24b-b6f6-46be-821d-43e5e121861b",
        crypto: "tk/btc",
        amount: 1.0,
      })
      .then((res) => {
        const expectedProperties = {
          data: expect.arrayContaining(
            ((items) => {
              return items.map(() => {
                return expect.objectContaining({
                  id: expect.any(String),
                  address: expect.any(String),
                  balance: expect.any(String),
                  crypto_id: expect.any(String),
                });
              });
            })(res.body.data)
          ),
        };

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(expectedProperties);
      });
  });
});
