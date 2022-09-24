import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { RowDataPacket } from 'mysql2/promise'
import { API_PATHS } from '../constants'
import getConnection from '../db/getConnection'
import getChangeEmailConfirmation from '../emailTemplates/changeEmailConfirmation'
import getResetPasswordConfirmation from '../emailTemplates/resetPasswordConfirmation'
import getSignupEmailConfirmation from '../emailTemplates/signupEmailConfirmation'
import decode from '../helper/decode'
import getTransport from '../helper/email'
import { authApiMiddleware } from '../middleware/auth'
import { UserInfoOnDB } from '../models/user'

dotenv.config()

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is not defined.')
}

const authApiRouter = Router()

// TODO: If something went wrong on the process, operation should be reverted.

authApiRouter.post(API_PATHS.AUTH.SIGNUP.dir, async (req, res, next) => {
  const {email, password} = req.body as {email?: string, password?: string}
  if (!email || !password) {
    // TODO: Define res type.
    return res.status(400).send({message: 'Missing email or password.'})
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  try {
    const connection = await getConnection()
    await connection.execute<RowDataPacket[][]>(`
      CALL create_user('${email}', '${hashedPassword}')
    `)
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).send({message: 'Email is already registered.'})
    }
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  try {
    var transport = await getTransport()
  } catch (e) {
    console.error(e)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  const token = generateEmailConfirmationToken(email)
  const mailOptions = {
    /**
     * Gmail server will overwrite to your gmail address.
     * @see https://nodemailer.com/usage/using-gmail/
    */
    from: {name: 'no-reply@markdown.com', address: 'no-reply@markdown.com'},
    to: email,
    subject: 'Welcome to Markdown Editor!',
    html: getSignupEmailConfirmation('http://localhost:19006', token)
  }
  try {
    await transport.sendMail(mailOptions)
    res.send({message: 'Confirmation email sent.'})
  } catch (error) {
    console.error(error)
    res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir, async (req, res, next) => {
  const {token} = req.body as {token?: string}
  if (!token) {
    return res.status(400).send({message: 'Missing token.'})
  }

  try {
    var {email} = decode<{email?: string}>(token, JWT_SECRET_KEY)
    if (!email) {
      throw new Error('email is not defined in the token.')
    }
  } catch (e) {
    console.error(e)
    return res.status(400).send({message: 'Invalid token.'})
  }

  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL activate_user('${email}');
    `)
    const {id, is_activated} = rows[0][0] as unknown as {id: number, is_activated: boolean}
    const token = generateAuthToken(id, email, is_activated)
    return res.send({message: 'Confirmation successful.', token})
  } catch (e: any) {
    if (e.sqlMessage === 'User already activated.') {
      return res.status(500).send({message: e.sqlMessage})
    }
    console.error(e)
    // TODO: Return appropriate error message for its reasons like already-activated/id-not-exists.
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.LOGIN.dir, async (req, res, next) => {
  const {email, password} = req.body as {email?: string, password?: string}
  if (!email || !password) {
    return res.status(400).send({message: 'Missing email or password.'})
  }

  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_user('${email}');
    `)

    const user = rows[0][0] as unknown as UserInfoOnDB
    if (!user) return res.status(400).send({message: 'Email/Password is incorrect.'})

    if (!user.is_activated) return res.status(401).send({message: 'This user is not activated.'})

    const isValidPassword = await bcrypt.compare(password, user.password)
    // TODO: Test incorrect password.
    if (!isValidPassword) return res.status(400).send({message: 'Email/Password is incorrect.'})

    const token = generateAuthToken(user.id, user.email, user.is_activated)
    res.send({message: 'Login successful.', token})
  } catch (error) {
    console.error(error)
    res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.EDIT.dir, authApiMiddleware, async (req, res, next) => {
  const {email: newEmail, password: newPassword} = req.body as {email?: string, password?: string}
  const {user: {id, email: oldEmail}} = req
  if (!newEmail && !newPassword) {
    return res.status(400).send({message: 'Missing email and password.'})
  }

  try {
    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      const connection = await getConnection()
      await connection.execute<RowDataPacket[][]>(`
        CALL update_user(
          ${id},
          NULL,
          '${hashedPassword}'
        );
      `)
    }
    if (newEmail) {
      try {
        var transport = await getTransport()
      } catch (e) {
        console.error(e)
        return res.status(500).send({message: 'Something went wrong.'})
      }

      // TODO: Test expiration.
      const token = generateEmailChangeToken(oldEmail, newEmail, {expiresIn: '30m'})
      const mailOptions = {
        /**
         * Gmail server will overwrite to your gmail address.
         * @see https://nodemailer.com/usage/using-gmail/
        */
        from: {name: 'no-reply@markdown.com', address: 'no-reply@markdown.com'},
        to: newEmail,
        subject: 'Markdown: Confirm your new email address.',
        html: getChangeEmailConfirmation('http://localhost:19006', token)
      }

      await transport.sendMail(mailOptions)
      res.send({message: 'Confirmation email sent.'})
    } else {
      return res.send({message: 'Password update successful.'})
    }
  } catch (e) {
    console.error(e)
    // TODO: Return appropriate error message for its reasons like already-activated/id-not-exists.
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir, async (req, res, next) => {
  const {token, password} = req.body as {token?: string, password?: string}
  if (!token || !password) {
    return res.status(400).send({message: 'Missing token or password.'})
  }

  try {
    var {oldEmail, newEmail} = decode<{oldEmail?: string, newEmail?: string}>(token, JWT_SECRET_KEY)
    if (!oldEmail || !newEmail) {
      console.error('oldEmail or newEmail is not defined on the token.', token)
      throw new Error('oldEmail or newEmail is not defined on the token.')
    }
  } catch (e) {
    console.error(e)
    return res.status(400).send({message: 'Invalid token.'})
  }

  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_user('${oldEmail}');
    `)

    var user = rows[0][0] as unknown as UserInfoOnDB
    if (!user) return res.status(400).send({message: `User with email: ${oldEmail} does not exist.`})

    const isValidPassword = await bcrypt.compare(password, user.password)
    // TODO: Test incorrect password.
    if (!isValidPassword) return res.status(400).send({message: 'Password is incorrect.'})
  } catch (error) {
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  try {
    const connection = await getConnection()
    await connection.execute<RowDataPacket[][]>(`
      CALL update_user(
        ${user.id},
        '${newEmail}',
        NULL
      );
    `)
    const token = generateAuthToken(user.id, newEmail, user.is_activated)
    return res.send({message: 'Email change successful.', token})
  } catch (e) {
    console.error(e)
    // TODO: Return appropriate error message for its reasons like already-activated/id-not-exists.
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.RESET_PASSWORD.dir, async (req, res, next) => {
  const {email} = req.body as {email?: string}
  if (!email) {
    return res.status(400).send({message: 'Missing email.'})
  }

  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_user('${email}');
    `)

    const user = rows[0][0] as unknown as UserInfoOnDB
    if (!user) return res.status(400).send({message: `There is no user with email: ${email}`})

    if (!user.is_activated) return res.status(401).send({message: 'This user is not activated.'})

    try {
      var transport = await getTransport()
    } catch (e) {
      console.error(e)
      return res.status(500).send({message: 'Something went wrong.'})
    }

    // TODO: Test expiration.
    const token = generateEmailConfirmationToken(user.email, {expiresIn: '30m'})
    const mailOptions = {
      /**
       * Gmail server will overwrite to your gmail address.
       * @see https://nodemailer.com/usage/using-gmail/
      */
      from: {name: 'no-reply@markdown.com', address: 'no-reply@markdown.com'},
      to: user.email,
      subject: 'Markdown: You asked to reset your password.',
      html: getResetPasswordConfirmation('http://localhost:19006', token)
    }

    await transport.sendMail(mailOptions)
    res.send({message: 'Confirmation email sent.'})
  } catch (error) {
    console.error(error)
    res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir, async (req, res, next) => {
  const {token, password} = req.body as {token?: string, password?: string}
  if (!token || !password) {
    return res.status(400).send({message: 'Missing token or password.'})
  }

  try {
    var {email} = decode<{email?: string}>(token, JWT_SECRET_KEY)
    if (!email) {
      console.error('email is not defined on the token.', token)
      throw new Error('email is not defined on the token.')
    }
  } catch (e) {
    console.error(e)
    return res.status(400).send({message: 'Invalid token.'})
  }

  try {
    const connection = await getConnection()
    const [rows, fields] = await connection.execute<RowDataPacket[][]>(`
      CALL get_user('${email}');
    `)

    var user = rows[0][0] as unknown as UserInfoOnDB
    if (!user) return res.status(400).send({message: `User with email: ${email} does not exist.`})
  } catch (error) {
    console.error(error)
    return res.status(500).send({message: 'Something went wrong.'})
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const connection = await getConnection()
    await connection.execute<RowDataPacket[][]>(`
      CALL update_user(
        ${user.id},
        NULL,
        '${hashedPassword}'
      );
    `)
    const token = generateAuthToken(user.id, email, user.is_activated)
    return res.send({message: 'Password reset successful.', token})
  } catch (e) {
    console.error(e)
    // TODO: Return appropriate error message for its reasons like already-activated/id-not-exists.
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

authApiRouter.post(API_PATHS.AUTH.DELETE.dir, authApiMiddleware, async (req, res, next) => {
  try {
    const connection = await getConnection()
    await connection.execute<RowDataPacket[][]>(`
      CALL delete_user(
        ${req.user.id}
      );
    `)
    return res.send({message: 'Delete successful.'})
  } catch (e) {
    console.error(e)
    // TODO: Return appropriate error message for its reasons like already-activated/id-not-exists.
    return res.status(500).send({message: 'Something went wrong.'})
  }
})

export default authApiRouter

// TODO: Modify frontend

// Add confirmation route to switch isActivated on database to true and notify confirmation is successful.

// Add frontend URL for confirmation.

// By clicking the link, frontend ask API to activate the user.

// Add message saying confirmation is successful and logged in.

// If the activation was successful, frontend login by accepting the token.

// Token should be updated when payload changed.

// If stored token is invalid, just ask login again.

function generateEmailConfirmationToken(email: string, options?: jwt.SignOptions): string {
  return jwt.sign(
    {email},
    JWT_SECRET_KEY!,
    options
  )
}

function generateAuthToken(id: number, email: string, isActivated: boolean): string {
  return jwt.sign(
    {id, email, isValidAuthToken: isActivated},
    JWT_SECRET_KEY!
  )
}

function generateEmailChangeToken(oldEmail: string, newEmail: string, options?: jwt.SignOptions): string {
  return jwt.sign(
    {oldEmail, newEmail},
    JWT_SECRET_KEY!,
    options
  )
}
