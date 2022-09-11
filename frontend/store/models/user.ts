import { AuthStateTypes } from '../../components/AuthModal'

interface AuthStateBase {
  type: AuthStateTypes
  emailValidationErrorMessage: string | null
  passwordValidationErrorMessage: string | null
  isLoading: boolean
  serverErrorMessage: string | null
  isSuccess: boolean
}
export interface AuthStateSignup extends AuthStateBase {
  type: AuthStateTypes.SIGNUP
  passwordConfirmValidationErrorMessage: string | null
}
export interface AuthStateLogin extends AuthStateBase {
  type: AuthStateTypes.LOGIN
}
export interface UserState {
  token: string | null
  email: string | null
  authState: null | AuthStateSignup | AuthStateLogin
  restoreIsDone: boolean
}
export interface UserStateRestore {
  token: string | null
  email: string | null
}
