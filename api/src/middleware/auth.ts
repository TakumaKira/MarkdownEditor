import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const auth: RequestHandler = (req: any, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  if (!process.env.JWT_SECRET_KEY) {
    console.error('JWT_SECRET_KEY is not defined.')
    return res.status(500).send('Something went wrong.')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = decoded
    next()
  } catch (ex) {
    console.error(ex)
    res.status(400).send("Invalid token.")
  }
}
export default auth
