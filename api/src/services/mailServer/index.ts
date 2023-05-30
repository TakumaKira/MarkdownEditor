import { CONFIRMATION_MAIL_SERVER_TYPE, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN, OAUTH_USER, SENDER_EMAIL, SENDGRID_API_KEY, STANDARD_MAIL_SERVER_HOST, STANDARD_MAIL_SERVER_PASS, STANDARD_MAIL_SERVER_USER } from "../../getEnvs"
import { MailServerGmail } from "./gmail"
import { MailServerSendGrid } from "./sendGrid"
import { MailServerStandardMailServer } from "./standardMailServer"
import { MailServer } from "./types"

export default (): MailServer => {
  return {
    'SendGrid': () => new MailServerSendGrid({
      API_KEY: SENDGRID_API_KEY
    }, SENDER_EMAIL),

    'StandardMailServer': () => new MailServerStandardMailServer({
      HOST: STANDARD_MAIL_SERVER_HOST,
      USER: STANDARD_MAIL_SERVER_USER,
      PASS: STANDARD_MAIL_SERVER_PASS,
    }, SENDER_EMAIL),

    'Gmail': () => new MailServerGmail({
      OAUTH_USER: OAUTH_USER,
      OAUTH_CLIENT_ID: OAUTH_CLIENT_ID,
      OAUTH_CLIENT_SECRET: OAUTH_CLIENT_SECRET,
      OAUTH_REFRESH_TOKEN: OAUTH_REFRESH_TOKEN,
    }, SENDER_EMAIL),
  }[CONFIRMATION_MAIL_SERVER_TYPE]()
}
