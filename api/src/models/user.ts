export interface UserToken {
  id: number
  email: string
  iat: number
}

export interface UserOnDB {
  id: number
  email: string
  password: string
}
