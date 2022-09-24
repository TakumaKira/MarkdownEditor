import { AuthStateTypes } from '../../components/AuthModal'

interface AuthStateBase {
  type: AuthStateTypes
  isLoading: boolean
  serverErrorMessage: string | null
  isDone: boolean
}
export interface AuthStateSignup extends AuthStateBase {
  type: AuthStateTypes.SIGNUP
  emailValidationErrorMessage: string | null
  passwordValidationErrorMessage: string | null
  passwordConfirmValidationErrorMessage: string | null
}
export interface AuthStateConfirmSignupEmail extends AuthStateBase {
  type: AuthStateTypes.CONFIRM_SIGNUP_EMAIL
}
export interface AuthStateLogin extends AuthStateBase {
  type: AuthStateTypes.LOGIN
  emailValidationErrorMessage: string | null
  passwordValidationErrorMessage: string | null
}
export interface UserState {
  token: string | null
  email: string | null
  authState: null | AuthStateSignup | AuthStateConfirmSignupEmail | AuthStateLogin
  restoreIsDone: boolean
}
export interface UserStateRestore {
  token: string | null
  email: string | null
}
