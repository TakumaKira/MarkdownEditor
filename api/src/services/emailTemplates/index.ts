import { FRONTEND_DOMAIN, FRONTEND_PROTOCOL, FRONTEND_PORT } from "../../getEnvs"
import getChangeEmailConfirmation from "./changeEmailConfirmation"
import getResetPasswordConfirmation from "./resetPasswordConfirmation"
import getSignupEmailConfirmation from "./signupEmailConfirmation"

export default function getConfirmationEmail(
  type: 'signup' | 'changeEmail' | 'resetPassword',
  token: string
): {subject: string, text: string, html: string} {
  return {
    'signup': getSignupEmailConfirmation(FRONTEND_PROTOCOL, FRONTEND_DOMAIN, token, FRONTEND_PORT),
    'changeEmail': getChangeEmailConfirmation(FRONTEND_PROTOCOL, FRONTEND_DOMAIN, token, FRONTEND_PORT),
    'resetPassword': getResetPasswordConfirmation(FRONTEND_PROTOCOL, FRONTEND_DOMAIN, token, FRONTEND_PORT),
  }[type]
}
