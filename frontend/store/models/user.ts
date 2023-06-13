import { AuthConfirmationStateTypes } from "../../constants/authConfirmationMessages"
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
export type AuthConfirmationState = {
  type: AuthConfirmationStateTypes
}
export type AuthConfirmationStateWithEmail = {
  type: AuthConfirmationStateTypes.SESSION_UNAUTHORIZED
  email: string | null
}
interface UserStateBase {
  email: string | null
  wsHandshakeToken: string | null
}
export interface UserState extends UserStateBase {
  authState: null | AuthStateSignup | AuthStateConfirmSignupEmail | AuthStateLogin | AuthStateEdit | AuthStateConfirmChangeEmail | AuthStateResetPassword | AuthStateConfirmResetPassword | AuthStateDelete
  confirmationState: null | AuthConfirmationState | AuthConfirmationStateWithEmail
  restoreIsDone: boolean
  firstSyncIsDone: boolean
}
export interface UserStateOnAsyncStorage extends UserStateBase {
}
