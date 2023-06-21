import jwt from 'jsonwebtoken'

export default function decodeToken<T>(token: string, jwtSecretKey: string): T {
  return jwt.verify(token, jwtSecretKey) as T
}
