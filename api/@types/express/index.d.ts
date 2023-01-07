import { UserInfoOnAuthToken } from '../../src/models/user'

declare global {
  namespace Express {
    interface Request {
      user: UserInfoOnAuthToken
    }
  }
}