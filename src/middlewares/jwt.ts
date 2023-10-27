import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from 'jsonwebtoken'

interface CustomRequest {
  userId: string
}

export function JWTValidation(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.replace('Bearer ', "")
  const privateKey = process.env.JWT_SECRET!

  if (!token) {
    return res.status(401).json({
      message: "Token não encontrado.",
      success: false
    })
  }

  jwt.verify(token, privateKey, (err: VerifyErrors | null, payload) => {
    if (err || payload  === undefined) {
      return res.status(401).end()
    }

    (req as unknown as CustomRequest).userId = payload.sub as string
    return next()
  })
}