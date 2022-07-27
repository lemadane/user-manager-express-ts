import { User } from './types'

export const loggedUserCache: { [key: string]: number } = {}

export const users: User[] = [
   {
      _id: '1',
      name: 'John Doe',
      email: 'john@gmail.com',
      password: '$2b$10$0ssjC5Mh9KJJYyYYLsAlGuISgQSXencnESjJr4xC5ll7fyeev.edu',
      active: true,
   },
   {
      _id: '2',
      name: 'Bob Williams',
      email: 'bob@gmail.com',
      password: '$2b$10$0ssjC5Mh9KJJYyYYLsAlGuISgQSXencnESjJr4xC5ll7fyeev.edu',
      active: true,
   },
   {
      _id: '3',
      name: 'Shannon Jackson',
      password: '$2b$10$0ssjC5Mh9KJJYyYYLsAlGuISgQSXencnESjJr4xC5ll7fyeev.edu',
      email: 'shannon@gmail.com',
      active: true,
   },
   {
      _id: 'a5ef790e-5ad6-4db0-8de5-490ff2b154f8',
      name: 'Lem',
      email: 'lem@email.com',
      password: '$2b$10$16WNnh3wKfGY9lw5TgDOt.Pfp0phPGnQBjioCramtpyj/xZqTEAfu',
      active: false,
   },
]
