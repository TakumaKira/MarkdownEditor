import jwt from 'jsonwebtoken'
import { JWT_SECRET_KEY } from "../getEnvs"
import { UserInfoOnDB } from '../models/user'
import db, { sql } from '../services/database';

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
  const user: UserInfoOnDB | undefined = (await db.query(sql`
    CALL get_user(${email});
  `))[0][0]
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
