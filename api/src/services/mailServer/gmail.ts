import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { MailServer } from './types'

type AuthSettingGmail = {
  OAUTH_USER: string
  OAUTH_CLIENT_ID: string
  OAUTH_CLIENT_SECRET: string
  OAUTH_REFRESH_TOKEN: string
}
export class MailServerGmail extends MailServer<AuthSettingGmail> {
  private OAuth2Client: OAuth2Client
  constructor(
    authSetting: AuthSettingGmail,
    senderEmail: string,
  ) {
    super(authSetting, senderEmail)
    this.OAuth2Client = this.getOAuth2Client()
  }
  async send(to: string, subject: string, text: string, html: string): Promise<void> {
    const mail = {
      /**
       * Gmail server will overwrite to your gmail address.
       * @see https://nodemailer.com/usage/using-gmail/
       */
      from: {name: this.senderEmail, address: this.senderEmail},
      to, subject, text, html
    }
    const transport = await this.getTransport()
    const result = await transport.sendMail(mail)
  }
  private async getTransport(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
    const {token: accessToken} = await this.OAuth2Client.getAccessToken()

    if (!accessToken) {
      throw new Error('accessToken was not provided.')
    }

    const {OAUTH_USER, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN} = this.authSetting
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
  private getOAuth2Client(): OAuth2Client {
    const {OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN} = this.authSetting
    const OAuth2 = google.auth.OAuth2
    const OAuth2Client = new OAuth2(
      OAUTH_CLIENT_ID,
      OAUTH_CLIENT_SECRET,
    )
    OAuth2Client.setCredentials({
      refresh_token: OAUTH_REFRESH_TOKEN
    })
    return OAuth2Client
  }
}
