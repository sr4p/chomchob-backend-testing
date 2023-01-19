import { Request, Response } from "express";
import JWT from "jsonwebtoken";
import User from '../models/users.model';
import { sequelize } from '../configs/db';

const validation = async (user: string, password: string): Promise<any> => {
  return {}
}

export const signUp = async (req : Request, res : Response) => {
  const { password , ...rest } = req.body
  const crytoPass = password
  const data = await User(sequelize).create({ password : crytoPass, ...rest })
  res.status(201).json();
}

export const signIn = async(req : Request, res : Response) => {
  const { username : user , password } = req.body
  const profile = await User(sequelize).findOne({ where : { username : user , password }})
  if(!profile) res.status(404).send()

  const { id , username , role , address } = profile?.dataValues
  const token : string = JWT.sign({ id , username, role , address }, process.env.JWT_SECRETKEY+"", { expiresIn: "1d" })

  res.status(200).json({ token });
}

export const userInfo = async (req : Request, res : Response) => {
  const splitedToken = req.headers.authorization?.split(" ")
  const token = (splitedToken && splitedToken.length == 2) ? splitedToken[1] : null
  if(!token) return res.status(401).send()

  const info = await new Promise((resolve) => (JWT.verify(token, process.env.JWT_SECRETKEY+"", (error, decoded) => (error) ? resolve(null) : resolve(decoded))));
  if(!info) return res.status(403).send()

  res.status(200).json(info);
}
