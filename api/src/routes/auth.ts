import bcrypt from 'bcrypt'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { RowDataPacket } from 'mysql2/promise'
import getConnection from '../db/getConnection'
import { UserInfoOnDB } from '../models/user'

const authApiRouter = Router()
console.log('TODO: Share path.')
authApiRouter.post('/signup', async (req, res, next) => {

})
console.log('TODO: Share path.')
authApiRouter.get('/login', async (req, res, next) => {
  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_user('${req.body.email}');
    `)

    const user = rows[0][0] as unknown as UserInfoOnDB
    if (!user) return res.status(400).send('Invalid email or password.')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid email or password.')

    const token = generateAuthToken(user.id, user.email)
    res.send(token)
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong.')
  }
})
export default authApiRouter

function generateAuthToken(id: number, email: string): string {
  if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is not defined.')
  return jwt.sign(
    {id, email},
    process.env.JWT_SECRET_KEY
  )
}
