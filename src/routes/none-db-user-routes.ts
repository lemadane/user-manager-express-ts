import { Request, Response, Router } from 'express'
import * as uuid from 'uuid'
import { User } from '../shared/types'
import * as bcrypt from 'bcrypt'
import {
   authenticateToken,
   genAccessToken,
   genRefreshToken,
} from '../middleware/authenticate-token'
import { users } from '../shared/data'

const noDbUserRoutes: Router = Router()

const userIdFilter = (req: Request) => {
   return (user: User) => {
      return user._id === req.params['id']
   }
}

// 
noDbUserRoutes.get('/', authenticateToken, (req: Request, res: Response) => {
   try {
      return res.json(req['user'])
   } catch (err) {
      return res.status(500).json({
         error: (err as Error).message,
      })
   }
})


// login
noDbUserRoutes.post('/login', async (req: Request, res: Response) => {
   try {
      const { email, password } = req.body
      const userWithGivenEmail = users.filter((user) => {
         return user.email === email
      })

      if (!userWithGivenEmail.length) {
         return res.status(401).json({
            error: 'Invalid user/password',
         })
      }

      const { _id, password: encryptedPassword } = userWithGivenEmail[0]
      const pwMatched = await bcrypt.compare(password, encryptedPassword)
      if (!pwMatched) {
         return res.status(401).json({
            error: 'Invalid user/password',
         })
      }
      const accessToken = genAccessToken(_id)
      const refreshToken = genRefreshToken(_id)
      return res.json({ accessToken, refreshToken })
   } catch (err) {
      return res.status(500).json({
         error: (err as Error).message,
      })
   }
})


// get by id
noDbUserRoutes.get(
   '/:id',
   authenticateToken,
   (req: Request, res: Response) => {
      try {
         const found = users.some(userIdFilter(req))
         if (!found) {
            return res.status(404).json({
               error: `No user with the id of ${req.params['id']}`,
            })
         }
         return res.json(users.filter(userIdFilter(req)))
      } catch (err) {
         return res.status(500).json({
            error: (err as Error).message,
         })
      }
   }
)

// create
noDbUserRoutes.post('/', authenticateToken, (req: Request, res: Response) => {
   try {
      const { name, email, password } = req.body
      if (!name || !email || !password) {
         return res
            .status(400)
            .json({ msg: 'Please include both name, email and password' })
      }
      const _id = uuid.v4()
      const newUser: User = {
         _id,
         name,
         email,
         password: bcrypt.hashSync(
            password,
            parseInt(<string>process.env['PW_SALT_ROUNDS'])
         ),
         active: true,
      }

      users.push(newUser)
      return res.status(201).json(users)
   } catch (err) {
      return res.status(500).json({
         error: (err as Error).message,
      })
   }
})

// update
noDbUserRoutes.patch(
   '/:id',
   authenticateToken,
   (req: Request, res: Response) => {
      try {
         const found = users.some(userIdFilter(req))
         if (!found) {
            return res.status(400).json({
               message: `No user with the id of ${req.params['id']}`,
            })
         }
         return users.forEach((user, i) => {
            if (userIdFilter(req)(user)) {
               const updatedUser: User = {
                  ...user,
                  ...req.body,
               }
               users[i] = updatedUser
               res.json({
                  message: 'User updated',
                  user: updatedUser,
               })
            }
         })
      } catch (err) {
         return res.status(500).json({
            error: (err as Error).message,
         })
      }
   }
)

// delete
noDbUserRoutes.delete(
   '/:id',
   authenticateToken,
   (req: Request, res: Response) => {
      try {
         const found = users.some(userIdFilter(req))
         if (!found) {
            return res
               .status(400)
               .json({ msg: `No user with the id of ${req.params['id']}` })
         }
         return res.json({
            message: 'User deleted',
            user: users.filter((user) => !userIdFilter(req)(user)),
         })
      } catch (err) {
         return res.status(500).json({
            error: (err as Error).message,
         })
      }
   }
)

export default noDbUserRoutes
