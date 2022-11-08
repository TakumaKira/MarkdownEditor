import dotenv from 'dotenv'
import { MailServer, MailServerGmail, MailServerSendGrid, MailServerStandardMailServer } from './services/mailServer'

dotenv.config()

// Network settings
const apiPort = process.env.API_PORT
const wsPort = process.env.WS_PORT
/** No need to validate. */
const frontendProtocol = process.env.USE_SECURE_PROTOCOL === 'true' ? 'https' : 'http'
const frontendDomain = process.env.FRONTEND_DOMAIN

// Json Web Token settings
const jwtSecretKey = process.env.JWT_SECRET_KEY

// Database settings
const databaseHost = process.env.DATABASE_HOST
const mysqlDatabaseUsernameForApp = process.env.MYSQL_DATABASE_USERNAME_FOR_APP
const mysqlDatabasePasswordForApp = process.env.MYSQL_DATABASE_PASSWORD_FOR_APP
const mysqlDatabase = process.env.MYSQL_DATABASE

// Confirmation email settings
/** Needed to be set to the address you own. */
const senderEmail = process.env.SENDER_EMAIL
/** type = 'SendGrid' | 'StandardMailServer' | 'Gmail' */
const confirmationMailServerType = process.env.CONFIRMATION_EMAIL_SERVER_TYPE

// SendGrid settings
const sendgridApiKey = process.env.SENDGRID_API_KEY

// Standard mail server settings
const standardMailServerHost = process.env.STANDARD_MAIL_SERVER_HOST
const standardMailServerUser = process.env.STANDARD_MAIL_SERVER_USER
const standardMailServerPass = process.env.STANDARD_MAIL_SERVER_PASS

// Gmail using OAuth settings
const oAuthUser = process.env.OAUTH_USER
const oAuthClientId = process.env.OAUTH_CLIENT_ID
const oAuthClientSecret = process.env.OAUTH_CLIENT_SECRET
const oAuthRefreshToken = process.env.OAUTH_REFRESH_TOKEN

// Validation
let isMissing = false

if (
  // Network settings
  !apiPort
  || !wsPort
  || !frontendDomain

  // Json Web Token settings
  || !jwtSecretKey

  // Database settings
  || !databaseHost
  || !mysqlDatabaseUsernameForApp
  || !mysqlDatabasePasswordForApp
  || !mysqlDatabase
) {
  // Network settings
  if (!apiPort) {
    console.error('API_PORT is not defined.')
  }
  if (!wsPort) {
    console.error('WS_PORT is not defined.')
  }
  if (!frontendDomain) {
    console.error('FRONTEND_DOMAIN is not defined.')
  }

  // Json Web Token settings
  if (!jwtSecretKey) {
    console.error('JWT_SECRET_KEY is not defined.')
  }

  // Database settings
  if (!databaseHost) {
    console.error('DATABASE_HOST is not defined.')
  }
  if (!mysqlDatabaseUsernameForApp) {
    console.error('MYSQL_DATABASE_USERNAME_FOR_APP is not defined.')
  }
  if (!mysqlDatabasePasswordForApp) {
    console.error('MYSQL_DATABASE_PASSWORD_FOR_APP is not defined.')
  }
  if (!mysqlDatabase) {
    console.error('MYSQL_DATABASE is not defined.')
  }

  isMissing = true
}

// Confirmation email settings
if (!senderEmail) {
  console.error('SENDER_EMAIL is not defined.')

  isMissing = true
}

let _mailServer: MailServer | undefined

if (confirmationMailServerType === 'SendGrid') {
  // SendGrid settings
  if (sendgridApiKey) {
    _mailServer = new MailServerSendGrid({
      API_KEY: sendgridApiKey
    }, senderEmail!)
  } else {
    console.error('SENDGRID_API_KEY is not defined.')

    isMissing = true
  }
} else if (confirmationMailServerType === 'StandardMailServer') {
  // Standard mail server settings
  if (
    standardMailServerHost
    && standardMailServerUser
    && standardMailServerPass
  ) {
    _mailServer = new MailServerStandardMailServer({
      HOST: standardMailServerHost,
      USER: standardMailServerUser,
      PASS: standardMailServerPass,
    }, senderEmail!)
  } else {
    if (!standardMailServerHost) {
      console.error('STANDARD_MAIL_SERVER_HOST is not defined.')
    }
    if (!standardMailServerUser) {
      console.error('STANDARD_MAIL_SERVER_USER is not defined.')
    }
    if (!standardMailServerPass) {
      console.error('STANDARD_MAIL_SERVER_PASS is not defined.')
    }

    isMissing = true
  }
} else if (confirmationMailServerType === 'Gmail') {
  // Gmail using OAuth settings
  if (
    oAuthUser
    && oAuthClientId
    && oAuthClientSecret
    && oAuthRefreshToken
  ) {
    _mailServer = new MailServerGmail({
      OAUTH_USER: oAuthUser,
      OAUTH_CLIENT_ID: oAuthClientId,
      OAUTH_CLIENT_SECRET: oAuthClientSecret,
      OAUTH_REFRESH_TOKEN: oAuthRefreshToken,
    }, senderEmail!)
  } else {
    if (!oAuthUser) {
      console.error('OAUTH_USER is not defined.')
    }
    if (!oAuthClientId) {
      console.error('OAUTH_CLIENT_ID is not defined.')
    }
    if (!oAuthClientSecret) {
      console.error('OAUTH_CLIENT_SECRET is not defined.')
    }
    if (!oAuthRefreshToken) {
      console.error('OAUTH_REFRESH_TOKEN is not defined.')
    }

    isMissing = true
  }
} else {
  console.error('CONFIRMATION_EMAIL_SERVER_TYPE is needed to be set to SendGrid | StandardMailServer | Gmail.')

  isMissing = true
}

if (isMissing) {
  throw new Error('Missing environment variables.')
}

// Network settings
export const API_PORT = Number(apiPort)
export const WS_PORT = Number(wsPort)
export const FRONTEND_PROTOCOL = frontendProtocol
export const FRONTEND_DOMAIN = frontendDomain!

// Json Web Token settings
export const JWT_SECRET_KEY = jwtSecretKey!

// Database settings
export const DATABASE_HOST = databaseHost!
export const MYSQL_DATABASE_USERNAME_FOR_APP = mysqlDatabaseUsernameForApp!
export const MYSQL_DATABASE_PASSWORD_FOR_APP = mysqlDatabasePasswordForApp!
export const MYSQL_DATABASE = mysqlDatabase!

// Confirmation email settings
export const mailServer = _mailServer!
