import dotenv from 'dotenv'
import { google } from 'googleapis'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

dotenv.config()

if (
  !process.env.OAUTH_USER
  || !process.env.OAUTH_CLIENT_ID
  || !process.env.OAUTH_CLIENT_SECRET
  || !process.env.OAUTH_REFRESH_TOKEN
) {
  throw new Error('OAuth client information not provided.')
}

const OAuth2 = google.auth.OAuth2
const OAuth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
)
OAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN
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
      user: process.env.OAUTH_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken,
    }
  })
}
export default getTransport
