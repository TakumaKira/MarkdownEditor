import jwt from 'jsonwebtoken'

const decodeToken = <T>(token: string, jwtSecretKey: string): T => {
  return jwt.verify(token, jwtSecretKey) as T
}
export default decodeToken
