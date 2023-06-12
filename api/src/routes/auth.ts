import bcrypt from 'bcrypt'
import { Router } from 'express'
import { TokenExpiredError } from 'jsonwebtoken'
import { API_PATHS, EMAIL_LENGTH_MAX, MIN_PASSWORD_LENGTH, WS_HANDSHAKE_TOKEN_KEY } from '../constants'
import getConfirmationEmail from '../services/emailTemplates'
import { JWT_SECRET_KEY } from '../getEnvs' // <- import is already done when setting up apiApp in global setup file before jest is ready, so there's no way to mock!
import decodeToken from '../services/decodeToken'
import { generateEmailConfirmationToken, generateEmailChangeToken } from '../services/encodeToken'
import { getApiAuthMiddleware } from '../middlewares/auth'
import Joi from 'joi'
import { destroySession, regenerateSession } from '../services/sessionStorage/utils'
import { Server } from 'socket.io'
import SessionStorageController from '../services/sessionStorage/controller'
import getMailServer from '../services/mailServer'
import { SessionStorageClient } from '../services/sessionStorage/type'
import getDatabaseController from '../services/database'
import { DatabaseClient } from '../services/database/types'

export default (wsServer: Server, dbClient: DatabaseClient, sessionStorageClient: SessionStorageClient, sessionStorageClientIsReady: Promise<void>) => {
  const authApiRouter = Router()

  const apiAuthMiddleware = getApiAuthMiddleware()

  const db = getDatabaseController(dbClient)

  const sessionStorage = new SessionStorageController(sessionStorageClient, sessionStorageClientIsReady)

  const mailServer = getMailServer()

  const emailSchema = Joi.string().email().max(EMAIL_LENGTH_MAX)
  const passwordSchema = Joi.string().min(MIN_PASSWORD_LENGTH)
  const signupRequestSchema = Joi.object<{email: string, password: string}>({
    email: emailSchema.required(),
    password: passwordSchema.required(),
  })

  authApiRouter.post(API_PATHS.AUTH.SIGNUP.dir, async (req, res, next) => {
    try {
      const result = signupRequestSchema.validate(req.body)
      if (result.error) {
        return res.status(400).send({message: result.error.message})
      }
      const {email, password} = result.value

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      try {
        await db.createUser(email, hashedPassword)
      } catch (error: any) {
        if (error?.sqlState === '45012') {
          return res.status(409).send({message: 'Email is already registered and activated.'})
        }
        console.error(error)
        return res.status(500).send({message: 'Something went wrong.'})
      }

      const token = generateEmailConfirmationToken('SignupToken', email)
      const {subject, text, html} = getConfirmationEmail('signup', token)

      await mailServer.send(email, subject, text, html)
      res.send({message: 'Confirmation email was sent.'})
    } catch (e) {
      next(e)
    }
  })

  const confirmSignupEmailRequestSchema = Joi.object<{token: string}>({
    token: Joi.string().required(),
  })
  authApiRouter.post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir, async (req, res, next) => {
    try {
      const result = confirmSignupEmailRequestSchema.validate(req.body)
      if (result.error) {
        return res.status(400).send({message: result.error.message})
      }
      const {token} = result.value

      try {
        var {is, email} = decodeToken<{is?: string, email?: string}>(token, JWT_SECRET_KEY)
        if (is !== 'SignupToken') {
          throw new Error('token is not SignupToken.')
        }
        if (!email) {
          throw new Error('email is not defined in the token.')
        }
      } catch {
        return res.status(400).send({message: 'Invalid token.'})
      }

      try {
        const {id, is_activated} = await db.activateUser(email)
        if (!is_activated) {
          throw new Error(`User with email ${email} is not activated successfully. Please try again.`)
        }
        await regenerateSession(req, sessionStorage, wsServer, { id: String(id), email })
        return res
          .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
          .send({message: 'Confirmation successful.', email})
      } catch (error: any) {
        if (error?.sqlState === '45011') {
          return res.status(400).send({message: 'The email you are trying to confirm does not exist on database.'})
        }
        if (error?.sqlState === '45013') {
          return res.status(409).send({message: 'User already activated.'})
        }
        throw error
      }
    } catch (e) {
      next(e)
    }
  })

  const loginRequestSchema = Joi.object<{email: string, password: string}>({
    email: emailSchema.required(),
    password: passwordSchema.required(),
  })
  authApiRouter.post(API_PATHS.AUTH.LOGIN.dir, async (req, res, next) => {
    try {
      const result = loginRequestSchema.validate(req.body)
      if (result.error) {
        await destroySession(req, sessionStorage)
        return res.status(400).send({message: result.error.message})
      }
      const {email, password} = result.value

      const user = await db.getUser(email)
      if (!user) {
        await destroySession(req, sessionStorage)
        return res.status(400).send({message: 'Email/Password is incorrect.'})
      }

      if (!user.is_activated) {
        await destroySession(req, sessionStorage)
        return res.status(400).send({message: 'This user is not activated.'})
      }

      const isValidPassword = await bcrypt.compare(password, user.hashed_password)
      if (!isValidPassword) {
        await destroySession(req, sessionStorage)
        return res.status(400).send({message: 'Email/Password is incorrect.'})
      }

      await regenerateSession(req, sessionStorage, wsServer, { id: String(user.id), email })
      res
        .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
        .send({message: 'Login successful.' })
    } catch (e) {
      next(e)
    }
  })

  authApiRouter.post(API_PATHS.AUTH.LOGOUT.dir, apiAuthMiddleware, async (req, res, next) => {
    try {
      await destroySession(req, sessionStorage)
      res.send({message: 'Logout successful.'})
    } catch (e) {
      next(e)
    }
  })

  const editRequestSchema = Joi.object<{email?: string, password?: string}>({
    email: emailSchema,
    password: passwordSchema,
  }).min(1)
  authApiRouter.post(API_PATHS.AUTH.EDIT.dir, apiAuthMiddleware, async (req, res, next) => {
    try {
      const result = editRequestSchema.validate(req.body)
      if (result.error) {
        return res.status(400).send({message: result.error.message})
      }
      const { email: newEmail, password: newPassword } = result.value
      const { userId: id, userEmail: oldEmail } = req.session
      if (!id || !oldEmail) {
        throw new Error('Session does not have required fields')
      }

      if (newPassword) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        await db.updateUserPassword(Number(id), hashedPassword)
      }
      if (newEmail) {
        const token = generateEmailChangeToken(oldEmail, newEmail, {expiresIn: '30m'})
        const {subject, text, html} = getConfirmationEmail('changeEmail', token)
        await mailServer.send(newEmail, subject, text, html)
        await regenerateSession(req, sessionStorage, wsServer)
        res
          .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
          .send({message: `Confirmation email was sent to ${newEmail}. Please check the inbox and confirm.`})
      } else {
        await regenerateSession(req, sessionStorage, wsServer)
        res
          .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
          .send({message: 'Password update successful.'})
      }
    } catch (e) {
      next(e)
    }
  })

  const confirmChangeEmailRequestSchema = Joi.object<{token: string, password: string}>({
    token: Joi.string().required(),
    password: passwordSchema.required(),
  })
  authApiRouter.post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir, async (req, res, next) => {
    try {
      const result = confirmChangeEmailRequestSchema.validate(req.body)
      if (result.error) {
        return res.status(400).send({message: result.error.message})
      }
      const {token, password} = result.value

      try {
        var {is ,oldEmail, newEmail} = decodeToken<{is?: string, oldEmail?: string, newEmail?: string}>(token, JWT_SECRET_KEY)
        if (is !== 'EmailChangeToken') {
          throw new Error('token is not EmailChangeToken.')
        }
        if (!oldEmail || !newEmail) {
          throw new Error('oldEmail or newEmail is not defined on the token.')
        }
      } catch (e) {
        if (e instanceof TokenExpiredError) {
          return res.status(400).send({message: 'Token expired. Please try again.'})
        }
        return res.status(400).send({message: 'Invalid token.'})
      }

      const user = await db.getUser(oldEmail)
      if (!user) return res.status(400).send({message: `User with email: ${oldEmail} does not exist.`})
      if (!user.is_activated) {
        return res.status(400).send({message: `User with email ${oldEmail} is not activated yet. Please activate then retry.`})
      }

      const isValidPassword = await bcrypt.compare(password, user.hashed_password)
      if (!isValidPassword) return res.status(400).send({message: 'Password is incorrect.'})

      await db.updateUserEmail(user.id, newEmail)
      await regenerateSession(req, sessionStorage, wsServer, { email: newEmail })
      return res
        .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
        .send({message: 'Email change successful.', email: newEmail})
    } catch (e) {
      next(e)
    }
  })

  const resetPasswordRequestSchema = Joi.object<{email: string}>({
    email: emailSchema.required(),
  })
  authApiRouter.post(API_PATHS.AUTH.RESET_PASSWORD.dir, async (req, res, next) => {
    try {
      const result = resetPasswordRequestSchema.validate(req.body)
      if (result.error) {
        return res.status(400).send({message: result.error.message})
      }
      const {email} = result.value

      const user = await db.getUser(email)
      if (!user) return res.status(400).send({message: `There is no user with email: ${email}`})

      if (!user.is_activated) return res.status(400).send({message: 'This user is not activated.'})

      const token = generateEmailConfirmationToken('ResetPasswordToken', email, {expiresIn: '30m'})
      const {subject, text, html} = getConfirmationEmail('resetPassword', token)
      await mailServer.send(email, subject, text, html)
      await regenerateSession(req, sessionStorage, wsServer)
      res
        .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
        .send({message: `Confirmation email was sent to ${email}. Please check the inbox and confirm.`})
    } catch (e) {
      next(e)
    }
  })

  const confirmResetPasswordRequestSchema = Joi.object<{token: string, password: string}>({
    token: Joi.string().required(),
    password: passwordSchema.required(),
  })
  authApiRouter.post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir, async (req, res, next) => {
    try {
      const result = confirmResetPasswordRequestSchema.validate(req.body)
      if (result.error) {
        return res.status(400).send({message: result.error.message})
      }
      const {token, password} = result.value

      try {
        var {is, email} = decodeToken<{is?: string, email?: string}>(token, JWT_SECRET_KEY)
        if (is !== 'ResetPasswordToken') {
          throw new Error('token is not ResetPasswordToken.')
        }
        if (!email) {
          throw new Error('email is not defined on the token.')
        }
      } catch {
        return res.status(400).send({message: 'Invalid token.'})
      }

      const user = await db.getUser(email)
      if (!user) return res.status(400).send({message: `User with email: ${email} does not exist.`})
      if (!user.is_activated) {
        return res.status(400).send({message: `User with email ${email} is not activated yet. Please activate then retry.`})
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      await db.updateUserPassword(user.id, hashedPassword)
      await regenerateSession(req, sessionStorage, wsServer)
      return res
        .header(WS_HANDSHAKE_TOKEN_KEY, req.session.wsHandshakeToken)
        .send({message: 'Password reset successful.', email})
    } catch (e) {
      next(e)
    }
  })

  authApiRouter.post(API_PATHS.AUTH.DELETE.dir, apiAuthMiddleware, async (req, res, next) => {
    try {
      try {
        await db.deleteUser(Number(req.session.userId))
        await destroySession(req, sessionStorage)
        return res.send({message: 'User deleted successfully.'})
      } catch (error: any) {
        if (error?.sqlState === '45011') {
          return res.status(400).send({message: 'The email you are trying to delete does not exist on database.'})
        }
        throw error
      }
    } catch (e) {
      next(e)
    }
  })

  return authApiRouter
}
