import { Request, Response, Router } from 'express'
import * as bcrypt from 'bcrypt'
import userModel from '../model/user-model'
import getUser from '../middleware/get-user'
import {
   authenticateToken,
   genAccessToken,
   genRefreshToken,
} from '../middleware/authenticate-token'
import * as jwt from 'jsonwebtoken'
import { loggedUserCache } from '../shared/data'

const userRoutes = Router()

// Getting all
userRoutes.get('/', async (_req: Request, res: Response) => {
   try {
      const users = await userModel.find()
      res.json(users)
   } catch (err) {
      res.status(500).json({ message: (<Error>err).message })
   }
})

// Getting One
userRoutes.get('/:id', getUser, (_req: Request, res: Response) => {
   res.json(res['user'])
})

// login
userRoutes.post('/login', async (req: Request, res: Response) => {
   try {
      const { email, password } = req.body
      const userWithGivenEmail = await userModel.findOne({ email })
      if (!userWithGivenEmail) {
         return res.status(401).json({
            error: 'Invalid user/password',
         })
      }
      const { _id, password: encryptedPassword } = userWithGivenEmail
      const pwMatched = await bcrypt.compare(password, encryptedPassword)
      if (!pwMatched) {
         return res.status(401).json({
            error: 'Invalid user/password',
         })
      }
      loggedUserCache[_id.toString()] = Date.now()
      const accessToken = genAccessToken(_id.toString())
      const refreshToken = genRefreshToken(_id.toString())
      return res.json({ accessToken, refreshToken })
   } catch (err) {
      return res.status(500).json({
         error: (err as Error).message,
      })
   }
})

// logout
userRoutes.post(
   '/logout',
   authenticateToken,
   async (req: Request, res: Response) => {
      try {
         delete loggedUserCache[req['authUser']?.id]
         res.sendStatus(204)
         return
      } catch (err) {
         return res.status(500).json({
            error: (err as Error).message,
         })
      }
   }
)

userRoutes.post('/refresh', (req: Request, res: Response) => {
   const refreshToken = req.body?.token
   if (!refreshToken) {
      res.sendStatus(401)
      return
   }
   jwt.verify(
      refreshToken,
      <string>process.env['REFRESH_TOKEN_SECRET'],
      (err, user) => {
         if (err) {
            res.sendStatus(403)
            return
         }
         if (user) {
            if (!loggedUserCache[user.id]) {
               res.sendStatus(403)
               return
            }
            const accessToken = genAccessToken(user.id)
            res.json({ accessToken })
            return
         }
      }
   )
})

// Creating one
userRoutes.post('/', async (req: Request, res: Response) => {
   try {
      const { name, email, password, active } = req.body
      const user = new userModel({
         name,
         email,
         password: bcrypt.hashSync(
            `${email}:${password}`,
            parseInt(<string>process.env['PW_SALT_ROUNDS'])
         ),
         active,
      })

      const newUser = await user.save()
      res.status(201).json(newUser)
   } catch (err) {
      res.status(400).json({ message: (<Error>err).message })
   }
})

// Updating One
userRoutes.patch('/:id', getUser, async (req: Request, res: Response) => {
   try {
      const { name, email, password, active } = req.body
      if (name) {
         res['user'].name = name
      }
      if (email) {
         res['user'].email = email
      }
      if (password) {
         res['user'].password = bcrypt.hashSync(
            password,
            parseInt(<string>process.env['PW_SALT_ROUNDS'])
         )
      }
      if (active === true || active === false) {
         res['user'].active = active
      }

      const updatedUser = await res['user'].save()
      res.json(updatedUser)
   } catch (err) {
      res.status(400).json({ message: (<Error>err).message })
   }
})

// Deleting One
userRoutes.delete(
   '/:id',
   authenticateToken,
   getUser,
   async (_req: Request, res: Response) => {
      try {
         await res['user'].remove()
         res.json({ message: 'User deleted.' })
      } catch (err) {
         res.status(500).json({ message: (<Error>err).message })
      }
   }
)

export default userRoutes
