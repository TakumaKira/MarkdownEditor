import { AuthStateTypes } from "../slices/user"

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
export interface AuthStateEdit extends AuthStateBase {
  type: AuthStateTypes.EDIT
  emailValidationErrorMessage: string | null
  passwordValidationErrorMessage: string | null
  passwordConfirmValidationErrorMessage: string | null
}
export interface AuthStateConfirmChangeEmail extends AuthStateBase {
  type: AuthStateTypes.CONFIRM_CHANGE_EMAIL
  token: string
  passwordValidationErrorMessage: string | null
}
export interface AuthStateResetPassword extends AuthStateBase {
  type: AuthStateTypes.RESET_PASSWORD
  emailValidationErrorMessage: string | null
}
export interface AuthStateConfirmResetPassword extends AuthStateBase {
  type: AuthStateTypes.CONFIRM_RESET_PASSWORD
  token: string
  passwordValidationErrorMessage: string | null
  passwordConfirmValidationErrorMessage: string | null
}
export interface AuthStateDelete extends AuthStateBase {
  type: AuthStateTypes.DELETE
}
export interface UserState {
  email: string | null
  wsHandshakeToken: string | null
  authState: null | AuthStateSignup | AuthStateConfirmSignupEmail | AuthStateLogin | AuthStateEdit | AuthStateConfirmChangeEmail | AuthStateResetPassword | AuthStateConfirmResetPassword | AuthStateDelete
  restoreIsDone: boolean
  firstSyncIsDone: boolean
}
export interface UserStateOnAsyncStorage {
  email: string | null
  wsHandshakeToken: string | null
}
