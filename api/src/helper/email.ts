import { google } from 'googleapis'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN, OAUTH_USER } from '../getEnvs'

const OAuth2 = google.auth.OAuth2
const OAuth2Client = new OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
)
OAuth2Client.setCredentials({
  refresh_token: OAUTH_REFRESH_TOKEN
})

const getTransport = async (): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> => {
  const {token: accessToken} = await OAuth2Client.getAccessToken()

  if (!accessToken) {
    throw new Error('accessToken was not provided.')
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: OAUTH_USER,
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
      accessToken,
    }
  })
}
export default getTransport
