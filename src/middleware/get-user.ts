import { NextFunction, Request, Response } from 'express'
import { User } from 'src/shared/types'
import userModel from '../model/user-model'


const getUser = async (req: Request, res: Response, next: NextFunction) => {
   let user: User | undefined | null
   try {
      user = await userModel.findById(req.params['id'])
      if (!user) {
         res.status(404).json({ message: 'Cannot find user' })
         return
      }
   } catch (err) {
      res.status(500).json({ message: (<Error>err).message })
      return
   }
   res['user'] = user
   next()
}

export default getUser