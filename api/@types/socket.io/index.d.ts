import { UserInfoOnAuthToken } from '../../src/models/user'

declare module 'socket.io' {
  interface Socket {
    user: UserInfoOnAuthToken
  }
}
