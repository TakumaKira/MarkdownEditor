export abstract class MailServer<AuthSetting extends Record<string, string> = any> {
  constructor(
    protected authSetting: AuthSetting,
    protected senderEmail: string,
  ) {}
  abstract send(to: string, subject: string, text: string, html: string): Promise<void>
}
