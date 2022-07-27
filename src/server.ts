import express, { Request, Response } from 'express'
import path from 'path'
import { engine as handlebars } from 'express-handlebars'
import { users } from './shared/data'
import noDbUserRoutes from './routes/none-db-user-routes'
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRoutes from './routes/user-routes'

const { error } = dotenv.config();
if (error) {
   throw error;
}

mongoose.connect(<string>process.env['DB_URI'])
mongoose.connection
   .on('error', (error) => console.error(error))
   .once('open', () => console.log('Connected to Database'))

const app = express()

app.engine(
   'handlebars',
   handlebars({
      defaultLayout: 'main',
      layoutsDir: path.join(process.cwd(), 'views/layouts'),
   })
)
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (_: Request, response: Response) => {
   return response.render('index', {
      title: 'User Manager',
      users,
   })
})

app.use(express.static(path.join(process.cwd(), 'public')))

app.use('/api/non-db/users', noDbUserRoutes)

app.use('/api/users', userRoutes)


const PORT = parseInt(<string>process.env['PORT']) || 8080
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
