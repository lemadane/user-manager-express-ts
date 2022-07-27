import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'

export const genAccessToken = (id: string) => {
   return jwt.sign({ id }, process.env['ACCESS_TOKEN_SECRET'] as string, {
      expiresIn: process.env['ACCESS_TOKEN_EXPIRATION'],
   })
}

export const genRefreshToken = (id: string) => {
   return jwt.sign({ id }, <string>process.env['REFRESH_TOKEN_SECRET'])
}

export const authenticateToken = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const authHeader = req.headers['authorization']
   const token = authHeader?.split(' ')[1]
   if (!token) {
      return res.sendStatus(401)
   }
   jwt.verify(
      token,
      <string>process.env['ACCESS_TOKEN_SECRET'],
      (err, user) => {
         if (err) {
            res.sendStatus(403)
         }
         if (user) {
            req['authUser'] = user
         }
         next()
      }
   )
   return null
}
