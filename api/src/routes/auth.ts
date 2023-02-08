import bcrypt from 'bcrypt'
import { Router } from 'express'
import { TokenExpiredError } from 'jsonwebtoken'
import { API_PATHS, EMAIL_LENGTH_MAX, MIN_PASSWORD_LENGTH } from '../constants'
import getConfirmationEmail from '../emailTemplates'
import { JWT_SECRET_KEY, mailServer } from '../getEnvs'
import decode from '../helper/decode'
import { generateEmailConfirmationToken, generateAuthToken, generateEmailChangeToken } from '../helper/encode'
import { apiAuthMiddleware } from '../middlewares/auth'
import { UserInfoOnDB } from '../models/user'
import Joi from 'joi'
import db from '../db/database';
import { sql } from '@databases/mysql';

const authApiRouter = Router()

// TODO: If something went wrong on the process, operation should be reverted.

const emailSchema = Joi.string().email().max(EMAIL_LENGTH_MAX)
const passwordSchema = Joi.string().min(MIN_PASSWORD_LENGTH)
const signupRequestSchema = Joi.object<{email: string, password: string}>({
  email: emailSchema.required(),
  password: passwordSchema.required(),
})
authApiRouter.post(API_PATHS.AUTH.SIGNUP.dir, async (req, res, next) => {
  const result = signupRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {email, password} = result.value

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  try {
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword})
    `)
  } catch (error: any) {
    if (error?.sqlState === '45012') {
      return res.status(409).send({message: 'Email is already registered and activated.'})
    }
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  const token = generateEmailConfirmationToken('SignupToken', email)
  const {subject, text, html} = getConfirmationEmail('signup', token)

  try {
    await mailServer.send(email, subject, text, html)
    res.send({message: 'Confirmation email sent.'})
  } catch (error: any) {
    console.error(error)
    console.error(JSON.stringify(error.response.body.errors))
    res.status(500).send({message: 'Something went wrong.'})
  }
})

const confirmSignupEmailRequestSchema = Joi.object<{token: string}>({
  token: Joi.string().required(),
})
authApiRouter.post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir, async (req, res, next) => {
  const result = confirmSignupEmailRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {token} = result.value

  try {
    var {is, email} = decode<{is?: string, email?: string}>(token, JWT_SECRET_KEY)
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
    const {id, is_activated} = (await db.query(sql`
      CALL activate_user(${email})
    `))[0][0] as {id: number, is_activated: boolean}
    if (!is_activated) {
      throw new Error(`User with email ${email} is not activated successfully. Please try again.`)
    }
    const token = await generateAuthToken(id, email)
    return res.send({message: 'Confirmation successful.', token})
  } catch (error: any) {
    if (error?.sqlState === '45011') {
      return res.status(400).send({message: 'The email you are trying to confirm does not exist on database.'})
    }
    if (error?.sqlState === '45013') {
      return res.status(409).send({message: 'User already activated.'})
    }
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

const loginRequestSchema = Joi.object<{email: string, password: string}>({
  email: emailSchema.required(),
  password: passwordSchema.required(),
})
authApiRouter.post(API_PATHS.AUTH.LOGIN.dir, async (req, res, next) => {
  const result = loginRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {email, password} = result.value

  try {
    const user: UserInfoOnDB | undefined = (await db.query(sql`
      CALL get_user(${email});
    `))[0][0]
    if (!user) return res.status(400).send({message: 'Email/Password is incorrect.'})

    if (!user.is_activated) return res.status(400).send({message: 'This user is not activated.'})

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) return res.status(400).send({message: 'Email/Password is incorrect.'})

    const token = await generateAuthToken(user.id, user.email)
    res.send({message: 'Login successful.', token})
  } catch (error) {
    console.error(error)
    res.status(500).send({message: 'Something went wrong.'})
  }
})

const editRequestSchema = Joi.object<{email?: string, password?: string}>({
  email: emailSchema,
  password: passwordSchema,
}).min(1)
authApiRouter.post(API_PATHS.AUTH.EDIT.dir, apiAuthMiddleware, async (req, res, next) => {
  const result = editRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {email: newEmail, password: newPassword} = result.value
  const {user: {id, email: oldEmail}} = req

  try {
    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      await db.query(sql`
        CALL update_user(
          ${id},
          NULL,
          ${hashedPassword}
        );
      `)
    }
    if (newEmail) {
      const token = generateEmailChangeToken(oldEmail, newEmail, {expiresIn: '30m'})
      const {subject, text, html} = getConfirmationEmail('changeEmail', token)
      await mailServer.send(newEmail, subject, text, html)
      res.send({message: `Confirmation email sent to ${newEmail}. Please check the inbox and confirm.`})
    } else {
      res.send({message: 'Password update successful.'})
    }
  } catch (e) {
    console.error(e)
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

const confirmChangeEmailRequestSchema = Joi.object<{token: string, password: string}>({
  token: Joi.string().required(),
  password: passwordSchema.required(),
})
authApiRouter.post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir, async (req, res, next) => {
  const result = confirmChangeEmailRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {token, password} = result.value

  try {
    var {is ,oldEmail, newEmail} = decode<{is?: string, oldEmail?: string, newEmail?: string}>(token, JWT_SECRET_KEY)
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

  let user: UserInfoOnDB | undefined
  try {
    user = (await db.query(sql`
      CALL get_user(${oldEmail});
    `))[0][0]

    if (!user) return res.status(400).send({message: `User with email: ${oldEmail} does not exist.`})
    if (!user.is_activated) {
      return res.status(400).send({message: `User with email ${oldEmail} is not activated yet. Please activate then retry.`})
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) return res.status(400).send({message: 'Password is incorrect.'})
  } catch (error) {
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  try {
    await db.query(sql`
      CALL update_user(
        ${user.id},
        ${newEmail},
        NULL
      );
    `)
    const token = await generateAuthToken(user.id, newEmail)
    return res.send({message: 'Email change successful.', token})
  } catch (e) {
    console.error(e)
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

const resetPasswordRequestSchema = Joi.object<{email: string}>({
  email: emailSchema.required(),
})
authApiRouter.post(API_PATHS.AUTH.RESET_PASSWORD.dir, async (req, res, next) => {
  const result = resetPasswordRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {email} = result.value

  try {
    const user: UserInfoOnDB | undefined = (await db.query(sql`
      CALL get_user(${email});
    `))[0][0]
    if (!user) return res.status(400).send({message: `There is no user with email: ${email}`})

    if (!user.is_activated) return res.status(400).send({message: 'This user is not activated.'})

    const token = generateEmailConfirmationToken('ResetPasswordToken', email, {expiresIn: '30m'})
    const {subject, text, html} = getConfirmationEmail('resetPassword', token)
    await mailServer.send(email, subject, text, html)
    res.send({message: `Confirmation email sent to ${email}. Please check the inbox and confirm.`})
  } catch (error) {
    console.error(error)
    res.status(500).send({message: 'Something went wrong.'})
  }
})

const confirmResetPasswordRequestSchema = Joi.object<{token: string, password: string}>({
  token: Joi.string().required(),
  password: passwordSchema.required(),
})
authApiRouter.post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir, async (req, res, next) => {
  const result = confirmResetPasswordRequestSchema.validate(req.body)
  if (result.error) {
    return res.status(400).send({message: result.error.message})
  }
  const {token, password} = result.value

  try {
    var {is, email} = decode<{is?: string, email?: string}>(token, JWT_SECRET_KEY)
    if (is !== 'ResetPasswordToken') {
      throw new Error('token is not ResetPasswordToken.')
    }
    if (!email) {
      throw new Error('email is not defined on the token.')
    }
  } catch {
    return res.status(400).send({message: 'Invalid token.'})
  }

  let user: UserInfoOnDB | undefined
  try {
    user = (await db.query(sql`
      CALL get_user(${email});
    `))[0][0]
    if (!user) return res.status(400).send({message: `User with email: ${email} does not exist.`})
    if (!user.is_activated) {
      return res.status(400).send({message: `User with email ${email} is not activated yet. Please activate then retry.`})
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await db.query(sql`
      CALL update_user(
        ${user.id},
        NULL,
        ${hashedPassword}
      );
    `)
    const token = await generateAuthToken(user.id, email)
    return res.send({message: 'Password reset successful.', token})
  } catch (e) {
    console.error(e)
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.DELETE.dir, apiAuthMiddleware, async (req, res, next) => {
  try {
    await db.query(sql`
      CALL delete_user(
        ${req.user.id}
      );
    `)
    return res.send({message: 'User deleted successfully.'})
  } catch (error: any) {
    if (error?.sqlState === '45011') {
      return res.status(400).send({message: 'The email you are trying to delete does not exist on database.'})
    }
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

export default authApiRouter

// TODO: Modify frontend

// Add message saying confirmation is successful and logged in.

// If the activation was successful, frontend login by accepting the token.

// Token should be updated when payload changed.

// If stored token is invalid, just ask login again.
