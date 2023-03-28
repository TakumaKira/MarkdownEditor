export interface UserInfoOnAuthToken {
  id: number
  email: string
  /** Check this property to validate the token is valid. Without this logic, API needs to ask database to be activated or not especially in auth middleware. */
  is: 'AuthToken'
  iat: number
}

export interface UserInfoOnDB {
  id: number
  email: string
  hashed_password: string
  is_activated: boolean
}
