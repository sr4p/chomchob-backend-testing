import express, { Response } from "express";
import Crypto from '../models/crypto.model';
import { sequelize } from "../configs/db";
declare interface Request extends express.Request {
  auth? : { [key:string] : any }
}

// ผู้ดูแลระบบสามารถดูยอดคงเหลือทั้งหมดของสกุลเงินดิจิทัลทั้งหมด
export const getBalance = async(req : Request, res : Response) => {
  const cryp = await  sequelize.query(`SELECT 
  DISTINCT(crypto.id) as crypto_id ,
  crypto.name as crypto_name,
  crypto.symbol as crypto_symbol,
  SUM(wallet.balance) as crypto_volume ,
  crypto.supply - SUM(wallet.balance) as crypto_balance,
  crypto.supply as crypto_supply,
  crypto.price as crypto_price,
  crypto.price * SUM(wallet.balance) as market_cap
  FROM cryptocurrency crypto JOIN wallet ON wallet.crypto_id = crypto.id 
  GROUP BY crypto.id`)

  // const wallet = await Wallet(sequelize).findAll({ attributes : [
  //   [sequelize.fn('DISTINCT', sequelize.col('crypto_id')) ,'id_crypto'],
  //   [sequelize.fn('SUM', sequelize.col('balance')), 'balance_crypto'],
  // ], group: ['crypto_id'] })
  
  res.json({ items : cryp.at(0)});
}

// ผู้ดูแลระบบสามารถเพิ่มสกุลเงินดิจิทัลอื่นๆ เช่น XRP, EOS, XLM ลงในกระเป๋าเงินได้
export const addCrypto = async(req : Request, res : Response) => {
  const { name , symbol , price, supply } = req.body;
  const data = await Crypto(sequelize).create({ name , symbol , price, supply })
  res.status(201).json({});
}

// ผู้ดูแลระบบสามารถจัดการอัตราแลกเปลี่ยนระหว่างสกุลเงินดิจิทัลได้
export const exchangeRate = async(req : Request, res : Response) => {
  const { id } = req.params;
  const { price } = req.body;
  const data = await Crypto(sequelize).update({ price },{ where : { id } , returning: ["id","name","symbol","price","supply"] });
  res.status(200).json(data[1].at(0));
}