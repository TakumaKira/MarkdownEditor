import jwt from 'jsonwebtoken'
import { JWT_SECRET_KEY } from "../getEnvs"

export function generateEmailConfirmationToken(is: 'SignupToken' | 'ResetPasswordToken', email: string, options?: jwt.SignOptions): string {
  return jwt.sign(
    {is, email},
    JWT_SECRET_KEY,
    options
  )
}

export function generateEmailChangeToken(oldEmail: string, newEmail: string, options?: jwt.SignOptions): string {
  return jwt.sign(
    {is: 'EmailChangeToken', oldEmail, newEmail},
    JWT_SECRET_KEY,
    options
  )
}
