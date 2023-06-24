import { API_PATHS } from "../../constants"

export default function getChangeEmailConfirmation(frontendProtocol: string, frontendDomain: string, token: string, frontendPort?: number): {subject: string, text: string, html: string} {
  return {
    subject: 'Markdown: Confirm your new email address.',
    text: `Please access to ${frontendProtocol}://${frontendDomain}${frontendPort !== undefined ? `:${frontendPort}` : ''}${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir}?token=${token} to confirm your email.`,
    html: `
      <div style="height: 100%; width: 100%; background-color: #2B2D31;">
        <div style="padding: 100px 0; text-align: center;">
          <p style="font-family: sans-serif; font-weight: 700; font-size: 36px; color: #ffffff; letter-spacing: 12px;">MARKDOWN</p>
          <p style="font-family: sans-serif; font-weight: 500; font-size: 28px; color: #7C8187; letter-spacing: 3px;">Is this your new email address?</p>
          <a href="${frontendProtocol}://${frontendDomain}${frontendPort !== undefined ? `:${frontendPort}` : ''}${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir}?token=${token}" style="text-decoration: none; color: #ffffff;">
            <div style="margin: auto; width: 230px; padding: 10px 0; background-color: #E46643; border-radius: 4px;">
              <span style="font-family: sans-serif; font-size: 15px;">
                Confirm New Email Address
              </span>
            </div>
          </a>
        </div>
      </div>
    `
  }
}
