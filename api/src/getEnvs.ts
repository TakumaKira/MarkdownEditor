import dotenv from 'dotenv'

dotenv.config()

const origin = process.env.ORIGIN
const apiPort = process.env.API_PORT
const wsPort = process.env.WS_PORT
const appPort = process.env.APP_PORT

const databaseHost = process.env.DATABASE_HOST
const mysqlDatabaseUsernameForApp = process.env.MYSQL_DATABASE_USERNAME_FOR_APP
const mysqlDatabasePasswordForApp = process.env.MYSQL_DATABASE_PASSWORD_FOR_APP
const mysqlDatabase = process.env.MYSQL_DATABASE

const jwtSecretKey = process.env.JWT_SECRET_KEY

const oAuthUser = process.env.OAUTH_USER
const oAuthClientId = process.env.OAUTH_CLIENT_ID
const oAuthClientSecret = process.env.OAUTH_CLIENT_SECRET
const oAuthRefreshToken = process.env.OAUTH_REFRESH_TOKEN

if (
  !origin
  || !apiPort
  || !wsPort
  || !appPort
  || !databaseHost
  || !mysqlDatabaseUsernameForApp
  || !mysqlDatabasePasswordForApp
  || !mysqlDatabase
  || !jwtSecretKey
  || !oAuthUser
  || !oAuthClientId
  || !oAuthClientSecret
  || !oAuthRefreshToken
) {
  if (!origin) {
    console.error('ORIGIN is not defined.')
  }
  if (!apiPort) {
    console.error('API_PORT is not defined.')
  }
  if (!wsPort) {
    console.error('WS_PORT is not defined.')
  }
  if (!appPort) {
    console.error('APP_PORT is not defined.')
  }
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
  if (!jwtSecretKey) {
    console.error('JWT_SECRET_KEY is not defined.')
  }
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
  throw new Error('Missing environment variables.')
}

export const ORIGIN = origin
export const API_PORT = Number(apiPort)
export const WS_PORT = Number(wsPort)
export const APP_PORT = Number(appPort)
export const DATABASE_HOST = databaseHost
export const MYSQL_DATABASE_USERNAME_FOR_APP = mysqlDatabaseUsernameForApp
export const MYSQL_DATABASE_PASSWORD_FOR_APP = mysqlDatabasePasswordForApp
export const MYSQL_DATABASE = mysqlDatabase
export const JWT_SECRET_KEY = jwtSecretKey
export const OAUTH_USER = oAuthUser
export const OAUTH_CLIENT_ID = oAuthClientId
export const OAUTH_CLIENT_SECRET = oAuthClientSecret
export const OAUTH_REFRESH_TOKEN = oAuthRefreshToken
