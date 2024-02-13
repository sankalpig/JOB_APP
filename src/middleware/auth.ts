import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

interface AuthenticatedRequest extends Request{
  user : JwtPayload
}

export const auth = (req : Request, res : Response, next : NextFunction) => {
  try{
    const token = req.cookies.token

    if(!token){
      return res.status(401).json({
        success : false,
        message : "TOKEN IS MISSING"
      })
    }

    try{
      const decode = jwt.verify(token, <string>process.env.JWT_SECRET);
      (req as AuthenticatedRequest).user = decode as JwtPayload
    }catch(err){
      return res.status(401).json({
        success : false,
        message : "TOKEN INVALID"
      })
    }
    next()
  }catch(err){
    return res.status(500).json({
      success : false,
      message : "TOKEN IS MISSING"
    })
  }
}