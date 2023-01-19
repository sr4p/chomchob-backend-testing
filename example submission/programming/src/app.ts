import bodyParser from "body-parser";
import express, { Application } from "express";
import 'express-async-errors';
import path from 'path'
import { wallet } from "./router/wallet";
import { auth } from "./router/auth";
import { crypto } from "./router/crypto";
import { errorHandler } from "./controller/middleware";

export const app: Application = express();
const prefix = "/api"

app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, ".")));

app.use(`${prefix}/wallet`, wallet)
app.use(`${prefix}/crypto`, crypto)
app.use(`${prefix}/auth`, auth)

app.use(errorHandler)