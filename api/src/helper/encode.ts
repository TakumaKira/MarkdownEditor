import jwt from 'jsonwebtoken'
import { RowDataPacket } from 'mysql2/promise'
import getConnection from '../db/getConnection'
import { JWT_SECRET_KEY } from "../getEnvs"
import { UserInfoOnDB } from '../models/user'

export function generateEmailConfirmationToken(is: 'SignupToken' | 'ResetPasswordToken', email: string, options?: jwt.SignOptions): string {
  return jwt.sign(
    {is, email},
    JWT_SECRET_KEY,
    options
  )
}

/**
 * This method will throw an error if the user with given id and email is not valid.
 */
export async function generateAuthToken(id: number, email: string): Promise<string> {
  const connection = await getConnection()
  const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
    CALL get_user('${email}');
  `)
  const user = rows[0][0] as unknown as (UserInfoOnDB | undefined)
  if (!user) {
    throw new Error(`User with email ${email} is not found.`)
  }
  if (user.id !== id) {
    throw new Error(`User with email ${email} has different id ${user.id} rather than ${id}.`)
  }
  if (!user.is_activated) {
    throw new Error(`User with email ${email} is not activated.`)
  }
  return jwt.sign(
    {is: 'AuthToken', id, email},
    JWT_SECRET_KEY
  )
}

export function generateEmailChangeToken(oldEmail: string, newEmail: string, options?: jwt.SignOptions): string {
  return jwt.sign(
    {is: 'EmailChangeToken', oldEmail, newEmail},
    JWT_SECRET_KEY,
    options
  )
}
