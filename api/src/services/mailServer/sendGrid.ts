import sgMail from '@sendgrid/mail'
import { MailServer } from './types'

type AuthSettingSendGrid = {
  API_KEY: string
}
export class MailServerSendGrid extends MailServer<AuthSettingSendGrid> {
  private sgMail: typeof sgMail
  constructor(
    authSetting: AuthSettingSendGrid,
    senderEmail: string,
  ) {
    super(authSetting, senderEmail)
    this.sgMail = this.setupSgMail()
  }
  async send(to: string, subject: string, text: string, html: string): Promise<void> {
    const mail = {
      to, from: this.senderEmail, subject, text, html
    }
    const result = await this.sgMail.send(mail)
  }
  private setupSgMail(): typeof sgMail {
    const {API_KEY} = this.authSetting
    sgMail.setApiKey(API_KEY)
    return sgMail
  }
}
