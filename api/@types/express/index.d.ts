import { User } from '../../src/models/user'

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}