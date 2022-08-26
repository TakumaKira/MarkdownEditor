export interface UserInfoOnToken {
  id: number
  email: string
  iat: number
}

export interface UserInfoOnDB {
  id: number
  email: string
  password: string
}
