import express, { NextFunction, Response } from "express";
import JWT from "jsonwebtoken";
declare interface Request extends express.Request {
    auth? : { [key:string] : any }
}

export enum role {
    admin = 'admin',
    user = 'user'
}

const splitToken = async (rawToken? : string) => {
    if(!rawToken) return null;

    const splitedToken = rawToken.split(" ")
    const token = (splitedToken && splitedToken.length == 2) ? splitedToken[1] : null
    return token
}

const verifyToken = async (token? : string) : Promise<unknown | { role : role ,[key:string] : any } | null> => {
    if(!token) return null;

    const info = await new Promise((resolve) => (JWT.verify(token, process.env.JWT_SECRETKEY+"", (error, decoded) => (error) ? resolve(null) : resolve(decoded))));
    return info;
}

export const roles = (roles : role[]) => {
    return async(req : Request, res : Response, next : NextFunction) => {
        const rawToken = req.headers.authorization
        const token = await splitToken(rawToken)
        if(!token) return res.status(401).send()

        const info = await verifyToken(token)
        if(!info) return res.status(401).send()

        const user = typeof info === "object" && "role" in info && info.role
        if(!roles.includes(role[<role>user])) return res.status(403).send()

        req.auth = info

        next()
    }
}

export const errorHandler = (err : any , req : Request , res : Response, next : NextFunction) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: err.stack
    })
}