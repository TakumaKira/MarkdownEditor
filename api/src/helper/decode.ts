import jwt from 'jsonwebtoken'

const decode = <T>(token: string, jwtSecretKey: string): T => {
  return jwt.verify(token, jwtSecretKey) as T
}
export default decode
