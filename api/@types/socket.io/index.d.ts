import { UserInfoOnToken } from '../../src/models/user'

declare module 'socket.io' {
  interface Socket {
    user: UserInfoOnToken
  }
}
