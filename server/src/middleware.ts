
import  jwt  from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
const JWT_SECRET =  process.env.JWT_SECRET || "ggiort";
import { Request, Response, NextFunction } from "express";



export function auth(req : Request, res:Response, next:NextFunction) {
  const {token} = req.headers;

  if(!token){
    res.status(400).json({
      message : "plz login no token"
    })
    return;
  }
  
  const tokenInfo = jwt.verify(token as string , JWT_SECRET);
  const jwtPayload = tokenInfo as JwtPayload;
  if (jwtPayload.userId) {
    req.body.userId = jwtPayload.userId;
    next();
  } else {
    res.status(400).json({
      message: "YOU ARE NOT LOGGED IN ",
    });
  }
}