import express, { Response } from "express";
import Wallet from '../models/wallet.model';
import { sequelize } from "../configs/db";
import { Op, Sequelize } from "sequelize";
import Crypto from '../models/crypto.model';
import { roleUser } from "../models/users.model";

declare interface Request extends express.Request {
  auth? : { [key:string] : any }
}

// ผู้ดูแลระบบสามารถเพิ่มและลดยอดคงเหลือสกุลเงินดิจิทัลของผู้ใช้ได้
export const walletBalance = async(req : Request, res : Response) => {
  const { address, crypto_id, amount } = req.body

  const balance = await Wallet(sequelize).findOne({ where : { address, crypto_id }, attributes : ["balance"]})
  if(balance && +balance?.dataValues.balance + amount < 0) return res.status(400).json({ message : "Balance not ignored!"});

  const data = await Wallet(sequelize).update({ balance: Sequelize.literal(`balance ${(amount || amount == 0 ) ? "+" : ""} ${amount}`)},{
    where: { address, crypto_id } ,
    returning: ["id","address","balance","crypto_id"]
  }).then(async (res) => {
    if(res.at(0) == 0 && amount > 0) return await Wallet(sequelize).create({  address, crypto_id , balance : amount })
    return res[1].at(0);
  })

  res.status(200).json({data});
}

// ผู้ใช้สามารถโอนสกุลเงินดิจิทัลเดียวกันไปยังผู้อื่นได้
export const walletTransfers = async(req : Request, res : Response) => {
  const { address_from, address_to, crypto, amount } = req.body
  const { address } = <roleUser>req.auth

  if(address != address_from) return res.status(403).json({ message : "Don't have permission"})

  const swarp = crypto.toLowerCase().split("/") // { btc } { tk }
  const coinFind = await Crypto(sequelize).findAll({ where : { symbol : { [Op.in] : swarp }}, attributes : ["id","symbol","price"]})
  if(!coinFind || !coinFind.length || coinFind.length != 2) return res.status(404).json({ message : "Cryptocurrency Some Not found!"})
  const coins = coinFind?.map(s => s.dataValues);

  const exchange = await  sequelize.query(`SELECT c.symbol as symbol, c.name as name, w.address as address, w.balance as balance, w.crypto_id as crypto_id
  FROM wallet w 
  JOIN cryptocurrency c ON w.crypto_id = c.id
  WHERE (w.address::VARCHAR = :address_from::VARCHAR AND LOWER(c.symbol) = :coinFrom) OR (w.address::VARCHAR = :address_to::VARCHAR AND LOWER(c.symbol) = LOWER(:coinTo));
  `,{ replacements : { coinFrom : swarp[0] , coinTo : swarp[1] , address_from, address_to }, raw : true })
  if(!exchange[0].length) return res.status(400).json({ message : "Wallet Not found!"})

  const cryptoAddress = (coin : string ) => exchange[0][exchange[0].findIndex((v:any) => v.symbol == coin)]

  const coinFrom = cryptoAddress(swarp[0])
  if(coinFrom && typeof coinFrom == "object" && "balance" in coinFrom && <number>coinFrom.balance < amount) return res.status(400).json({ message : "Balance not ignored!"});
  
  const coinTo = cryptoAddress(swarp[1])
  if(!coinTo){
    const c_id = coins[coins.findIndex((v:any) => v.symbol == swarp[1])]
    await Wallet(sequelize).create({ address : address_to, crypto_id : c_id.id })
  } 
  
  // address_from (60 BTC) 1000฿ : balance = balance - amount
  // -> amount : 50
  // address_to (TK) 100฿ : (price:BTC/price:TK) * amount

  const findCid = (symbol : string) => coins[coins.findIndex((v:any) => v.symbol == symbol)]
  const findPriceBySymbol = (symbol : string) : number => +(findCid(symbol)).price

  console.log(`${swarp[0]} :`,amount);
  console.log(`${swarp[1]} :`,(findPriceBySymbol(swarp[0]) / findPriceBySymbol(swarp[1])) * amount);

   const data = await Wallet(sequelize).update({ balance: Sequelize.literal(`CASE 
  WHEN (address::VARCHAR like '${address_from}'::VARCHAR AND crypto_id::VARCHAR like '${findCid(swarp[0]).crypto_id}'::VARCHAR) THEN balance - ${amount}
  WHEN (address::VARCHAR like '${address_to}'::VARCHAR AND crypto_id::VARCHAR like '${findCid(swarp[1]).crypto_id}'::VARCHAR) THEN balance + ${(findPriceBySymbol(swarp[0]) / findPriceBySymbol(swarp[1])) * amount }
  ELSE balance END
  `)},{
    where: { address : { [Op.in] : [address_from,address_to] }, crypto_id : { [Op.in] : coins.map(c => c.id) }},
    returning: ["id","address","balance","crypto_id"]
  })

  res.status(200).json({ data : data[1] });
}