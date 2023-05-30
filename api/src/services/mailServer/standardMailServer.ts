import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { MailServer } from './types'

type AuthSettingStandardMailServer = {
  HOST: string
  USER: string
  PASS: string
}
export class MailServerStandardMailServer extends MailServer<AuthSettingStandardMailServer> {
  constructor(
    authSetting: AuthSettingStandardMailServer,
    senderEmail: string,
  ) {
    super(authSetting, senderEmail)
  }
  async send(to: string, subject: string, text: string, html: string): Promise<void> {
    const mail = {
      from: {name: this.senderEmail, address: this.senderEmail},
      to, subject, text, html
    }
    const transport = await this.getTransport()
    const result = await transport.sendMail(mail)
  }
  private async getTransport(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
    const {HOST, USER, PASS} = this.authSetting
    return nodemailer.createTransport({
      host: HOST,
      port: 465,
      secure: true, // use TLS
      auth: {
        user: USER,
        pass: PASS,
      }
    })
  }
}
