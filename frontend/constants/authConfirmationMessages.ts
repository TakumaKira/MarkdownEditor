import { AuthConfirmationStateWithEmail, UserState } from "../store/models/user"

export enum AuthConfirmationStateTypes {
  SESSION_UNAUTHORIZED = 'sessionUnauthorized',
}

export const authConfirmationMessages: {[key in AuthConfirmationStateTypes]: {
  title: string
  getMessage: (confirmationState: UserState['confirmationState']) => string
  buttonLabel: string
}} = {
  [AuthConfirmationStateTypes.SESSION_UNAUTHORIZED]: {
    title: 'Please login again.',
    getMessage: (confirmationState: UserState['confirmationState']) => "You are not authorized to access your online resources. Most likely because your session as `" + (confirmationState as AuthConfirmationStateWithEmail).email + "` has expired. Please try logging in again.",
    buttonLabel: 'OK',
  },
}
