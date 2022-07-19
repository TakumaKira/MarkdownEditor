import bcrypt from 'bcrypt'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { RowDataPacket } from 'mysql2/promise'
import getConnection from '../db/getConnection'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`CALL get_user('${req.body.name}')`)

    const user = rows[0][0] as unknown as {id: number, name: string, password: string}
    if (!user) return res.status(400).send('Invalid email or password.')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid email or password.')

    const token = generateAuthToken(user.id, user.name)
    res.send(token)
  } catch (error) {
    console.error(error)
    return res.status(400).send('Something went wrong.')
  }
})
export default router

function generateAuthToken(id: number, name: string): string {
  if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is not defined.')
  return jwt.sign(
    {id, name},
    process.env.JWT_SECRET_KEY
  )
}
