import request from 'supertest'
import { API_PATHS } from '../../src/constants'
import getConnectionPool, { ConnectionPool, sql } from '../../src/db/database'
import apiApp, { wsServer } from '../../src/servers/api'
import { JWT_SECRET_KEY, mailServer } from '../../src/getEnvs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import decode from '../../src/helper/decode'
import { UserInfoOnToken } from '../../src/models/user'

jest.mock('../../src/getEnvs', () => ({
  ...jest.requireActual('../../src/getEnvs'),
  mailServer: {
    send: jest.fn()
  }
}))

// TODO: Update main script to use @database/mysql?

let db: ConnectionPool
beforeAll(() => {
  db = getConnectionPool()
})
afterAll(() => {
  return db.dispose()
})

beforeEach(() => {
  // Initialize users table.
  return db.query(sql`
    DELETE FROM users;
  `)
})
afterEach(() => {
  wsServer.close()
})

describe(`POST ${API_PATHS.AUTH.SIGNUP.path}`, () => {
  test('returns 400 if email and password are not provided on request body', async () => {
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Missing email or password.')
  })

  test('returns 400 if email is not provided on request body', async () => {
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Missing email or password.')
  })

  test('returns 400 if password is not provided on request body and new user does not be created', async () => {
    const email = 'test@email.com'
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Missing email or password.')
    // Make sure the user is not created.
    const result = await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `)
    expect(result).toEqual([])
  })

  test('returns 409 if email is already registered and activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    // Signup the user again and check error response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email, password})
    // Make sure the user is not updated.
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Email is already registered and activated.')
  })

  test('creates un-activated user and send signup confirmation email if email is not registered yet', async () => {
    const mockMailServerSend = mailServer.send
    const email = 'test@email.com'
    const password = 'password'
    // Signup a user and check response.
    await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email, password})
    // Make sure if the un-activated user is created.
    const result = await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `)
    expect(result).toEqual([{
      id: expect.any(Number),
      email,
      password: expect.any(String),
      is_activated: 0
    }])
    const isRegisteredPassword = await bcrypt.compare(password, result[0].password)
    expect(isRegisteredPassword).toBe(true)
    // Make sure a signup confirmation email is sent.
    expect(mockMailServerSend).toBeCalledWith(email, expect.any(String), expect.any(String), expect.any(String))
  })

  test('overwrites password and send signup confirmation email if email is already registered but not activated', async () => {
    const mockMailServerSend = mailServer.send
    const email = 'test@email.com'
    const password1 = 'password1'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword1 = await bcrypt.hash(password1, salt)
    const password2 = 'password2'
    // Create un-activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword1},
        false
      );
    `)
    // Signup the user again and check response.
    await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email, password: password2})
    // Make sure the password is updated.
    const result = await db.query(sql`
      SELECT password
        FROM users
        WHERE email = ${email};
    `)
    const isOriginalPassword = await bcrypt.compare(password1, result[0].password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(password2, result[0].password)
    expect(isUpdatedPassword).toBe(true)
    // Make sure a signup confirmation email is sent.
    expect(mockMailServerSend).toBeCalledWith(email, expect.any(String), expect.any(String), expect.any(String))
  })
})

describe(`POST ${API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path}`, () => {
  test('returns 400 if request does not have token', async () => {
    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe('Missing token.')

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe('Missing token.')
  })

  test('returns 400 if token did not encoded with correct secret', async () => {
    const token = jwt.sign(
      {email: 'test@email.com'},
      `${JWT_SECRET_KEY}1`
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if token does not have email', async () => {
    const token = jwt.sign(
      {someProp: 'someValue'},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 409 if the email does not exist', async () => {
    const token = jwt.sign(
      {email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('The email you are trying to confirm does not exist on database.')
  })

  test('returns 409 if the email is already activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    // Try to activate again and check the response.
    const token = jwt.sign(
      {email},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('User already activated.')
  })

  test('returns valid login token if activation was succeeded', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create un-activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        false
      );
    `)
    // Try to activate and check the response.
    const token = jwt.sign(
      {email},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(200)
    const authToken = res.body?.token
    expect(typeof authToken).toBe('string')
    const decodedAuthToken = decode<UserInfoOnToken>(authToken, JWT_SECRET_KEY)
    expect(decodedAuthToken.isValidAuthToken).toBe(true)
    expect(decodedAuthToken.email).toBe(email)
  })
})

describe(`POST ${API_PATHS.AUTH.LOGIN.path}`, () => {
  test('returns 400 if email and password are not provided on request body', async () => {
    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe('Missing email or password.')

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe('Missing email or password.')
  })

  test('returns 400 if email is not provided on request body', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Missing email or password.')
  })

  test('returns 400 if password is not provided on request body', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({email: 'test@email.com'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Missing email or password.')
  })

  test('returns 400 if user with given email does not exist', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: 'test@email.com', password: 'password' })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Email/Password is incorrect.')
  })

  test('returns 400 if user with given email is not activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create un-activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        false
      );
    `)
    // Try to login and check the response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('This user is not activated.')
  })

  test('returns 400 if password is not correct', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    // Try to login and check the response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password: `${password}1` })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Email/Password is incorrect.')
  })

  test('returns auth token if email and password are correct and user is activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    // Try to login and check the response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password })
    expect(res.status).toBe(200)
    const authToken = res.body?.token
    expect(typeof authToken).toBe('string')
    const decodedAuthToken = decode<UserInfoOnToken>(authToken, JWT_SECRET_KEY)
    expect(decodedAuthToken.isValidAuthToken).toBe(true)
    expect(decodedAuthToken.email).toBe(email)
  })
})

describe(`POST ${API_PATHS.AUTH.EDIT.path}`, () => {
  // Test if authApiMiddleware is working.
  test('returns 401 if no auth token provided', async () => {
    const email = 'test@email.com'
    const password = 'password'

    const resForNoSet = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .send({ email, password })
    expect(resForNoSet.status).toBe(401)
    expect(resForNoSet.body.message).toBe('Access denied. Request does not have valid token.')

    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .send({ email, password })
    expect(resForUndefined.status).toBe(401)
    expect(resForUndefined.body.message).toBe('Access denied. Request does not have valid token.')

    const resForEmptyString = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': ''})
      .send({ email, password })
    expect(resForEmptyString.status).toBe(401)
    expect(resForEmptyString.body.message).toBe('Access denied. Request does not have valid token.')
  })

  test('returns 401 if auth token is not valid', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const newPassword = 'newPassword'
    const validAuthToken = jwt.sign(
      {id: 1, email: oldEmail, isValidAuthToken: true},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': `${validAuthToken}1`})
      .send({ email: newEmail, password: newPassword })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Access denied. Request does not have valid token.')
  })

  test('returns 401 if given token is not encoded with right secret', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const newPassword = 'newPassword'
    const invalidAuthToken = jwt.sign(
      {id: 1, email: oldEmail, isValidAuthToken: true},
      `${JWT_SECRET_KEY}1`
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': invalidAuthToken})
      .send({ email: newEmail, password: newPassword })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Access denied. Request does not have valid token.')
  })

  test('returns 401 if given token is email confirmation token', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const newPassword = 'newPassword'
    const nonAuthToken = jwt.sign(
      {email: oldEmail},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': nonAuthToken})
      .send({ email: newEmail, password: newPassword })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Access denied. Request does not have valid token.')
  })

  test('returns 400 if both email and password is missing', async () => {
    const email = 'test@email.com'
    const validAuthToken = jwt.sign(
      {id: 1, email, isValidAuthToken: true},
      JWT_SECRET_KEY
    )

    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': validAuthToken})
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe('Missing both email and password.')

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': validAuthToken})
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe('Missing both email and password.')
  })

  test('sends confirmation mail if only new email is provided and returns message', async () => {
    const mockMailServerSend = mailServer.send
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const validAuthToken = jwt.sign(
      {id: 1, email: oldEmail, isValidAuthToken: true},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': validAuthToken})
      .send({email: newEmail})
    expect(mockMailServerSend).toBeCalledWith(newEmail, expect.any(String), expect.any(String), expect.any(String))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Confirmation email sent.')
  })

  test('updates password and returns password update success message if only new password is provided', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await db.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id as number
    const validAuthToken = jwt.sign(
      {id, email, isValidAuthToken: true},
      JWT_SECRET_KEY
    )
    const newPassword = 'newPassword'
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': validAuthToken})
      .send({password: newPassword})
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Password update successful.')
    const result = await db.query(sql`
      SELECT password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].password)
    expect(isUpdatedPassword).toBe(true)
  })

  test('updates only password and sends confirmation mail if both new email and new password is provided', async () => {
    const mockMailServerSend = mailServer.send
    const oldEmail = 'old@email.com'
    const oldPassword = 'oldPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await db.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id as number
    const validAuthToken = jwt.sign(
      {id, email: oldEmail, isValidAuthToken: true},
      JWT_SECRET_KEY
    )
    const newEmail = 'new@email.com'
    const newPassword = 'newPassword'
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set({'x-auth-token': validAuthToken})
      .send({email: newEmail, password: newPassword})
    expect(mockMailServerSend).toBeCalledWith(newEmail, expect.any(String), expect.any(String), expect.any(String))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Confirmation email sent.')
    const result = await db.query(sql`
      SELECT email, password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].password)
    expect(isUpdatedPassword).toBe(true)
  })
})

describe(`POST ${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path}`, () => {
  test('', async () => {

  })

  test('', async () => {

  })
})

describe(`POST ${API_PATHS.AUTH.RESET_PASSWORD.path}`, () => {
  test('', async () => {

  })

  test('', async () => {

  })
})

describe(`POST ${API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path}`, () => {
  test('', async () => {

  })

  test('', async () => {

  })
})

describe(`POST ${API_PATHS.AUTH.DELETE.path}`, () => {
  // TODO: Test if authApiMiddleware is working.

  test('', async () => {

  })

  test('', async () => {

  })
})

describe('WebSocket', () => {
  // TODO: Test if authWsMiddleware is working.
})