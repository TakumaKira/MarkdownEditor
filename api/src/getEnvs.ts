import dotenv from 'dotenv'

dotenv.config()

// Network settings
const apiPort = process.env.API_PORT
const wsPort = process.env.WS_PORT
/** No need to validate. */
const frontendProtocol = process.env.USE_SECURE_PROTOCOL === 'true' ? 'https' : 'http'
const frontendDomain = process.env.FRONTEND_DOMAIN
const frontendPort = process.env.FRONTEND_PORT

// Json Web Token settings
const jwtSecretKey = process.env.JWT_SECRET_KEY

// Database settings
const databaseHost = process.env.DATABASE_HOST
const mysqlDatabase = process.env.MYSQL_DATABASE
const mysqlUser = process.env.MYSQL_USER
const mysqlPassword = process.env.MYSQL_PASSWORD

// Redis settings
const redisHost = process.env.REDIS_HOST

// Confirmation email settings
/** Needed to be set to the address you own. */
const senderEmail = process.env.SENDER_EMAIL
const validateConfirmationMailServerType = (type: string | undefined): 'SendGrid' | 'StandardMailServer' | 'Gmail' | undefined => {
  if (
    type !== 'SendGrid'
    && type !== 'StandardMailServer'
    && type !== 'Gmail'
  ) {
    return undefined
  }
  return type
}
const confirmationMailServerType = validateConfirmationMailServerType(process.env.CONFIRMATION_EMAIL_SERVER_TYPE)

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

// Missing validations
if (process.env.NODE_ENV !== 'test') {

  /** Validation checker flag */
  let isMissing = false

  // Network settings
  if (
    !apiPort
    || !wsPort
    || !frontendDomain
  ) {
    if (!apiPort) {
      console.error('API_PORT is not defined.')
    }
    if (!wsPort) {
      console.error('WS_PORT is not defined.')
    }
    if (!frontendDomain) {
      console.error('FRONTEND_DOMAIN is not defined.')
    }

    isMissing = true
  }

  // Json Web Token settings
  if (
    !jwtSecretKey
  ) {
    if (!jwtSecretKey) {
      console.error('JWT_SECRET_KEY is not defined.')
    }

    isMissing = true
  }

  // Database settings
  if (
    !databaseHost
    || !mysqlDatabase
    || !mysqlUser
    || !mysqlPassword
  ) {
    if (!databaseHost) {
      console.error('DATABASE_HOST is not defined.')
    }
    if (!mysqlDatabase) {
      console.error('MYSQL_DATABASE is not defined.')
    }
    if (!mysqlUser) {
      console.error('MYSQL_USER is not defined.')
    }
    if (!mysqlPassword) {
      console.error('MYSQL_PASSWORD is not defined.')
    }

    isMissing = true
  }

  // Redis settings
  if (
    !redisHost
  ) {
    console.error('REDIS_HOST is not defined.')

    isMissing = true
  }

  // Confirmation email settings
  if (
    !senderEmail
  ) {
    console.error('SENDER_EMAIL is not defined.')

    isMissing = true
  }

  if (confirmationMailServerType === 'SendGrid') {
    // SendGrid settings
    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY is not defined.')

      isMissing = true
    }
  } else if (confirmationMailServerType === 'StandardMailServer') {
    // Standard mail server settings
    if (
      !standardMailServerHost
      || !standardMailServerUser
      || !standardMailServerPass
    ) {
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
      !oAuthUser
      || !oAuthClientId
      || !oAuthClientSecret
      || !oAuthRefreshToken
    ) {
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
}

// Network settings
export const API_PORT = Number(apiPort)
export const WS_PORT = Number(wsPort)
export const FRONTEND_PROTOCOL = frontendProtocol
export const FRONTEND_DOMAIN = frontendDomain!
/** This is used only frontend is in development mode. */
export const FRONTEND_PORT = frontendPort

// Json Web Token settings
export const JWT_SECRET_KEY = jwtSecretKey!

// Redis settings
export const REDIS_HOST = redisHost || 'localhost'

// Database settings
export const DATABASE_HOST = databaseHost!
export const MYSQL_DATABASE = mysqlDatabase!
export const MYSQL_USER = mysqlUser!
export const MYSQL_PASSWORD = mysqlPassword!

// Confirmation email settings
export const SENDER_EMAIL = senderEmail!
export const CONFIRMATION_MAIL_SERVER_TYPE = confirmationMailServerType!
export const SENDGRID_API_KEY = sendgridApiKey!
export const STANDARD_MAIL_SERVER_HOST = standardMailServerHost!
export const STANDARD_MAIL_SERVER_USER = standardMailServerUser!
export const STANDARD_MAIL_SERVER_PASS = standardMailServerPass!
export const OAUTH_USER = oAuthUser!
export const OAUTH_CLIENT_ID = oAuthClientId!
export const OAUTH_CLIENT_SECRET = oAuthClientSecret!
export const OAUTH_REFRESH_TOKEN = oAuthRefreshToken!
