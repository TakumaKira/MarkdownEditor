import request from 'supertest'
import { API_PATHS } from '../../src/constants'
import getConnectionPool, { ConnectionPool, sql } from '../../src/db/database'
import apiApp, { wsServer } from '../../src/servers/api'
import { mailServer } from '../../src/getEnvs'
import bcrypt from 'bcrypt'

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
  test('should return 400 if email and password is not provided on request body', async () => {
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({})
    expect(res.status).toBe(400)
  })

  test('should return 400 if email is not provided on request body', async () => {
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({password: 'password'})
    expect(res.status).toBe(400)
  })

  test('should return 400 if password is not provided on request body', async () => {
    const email = 'test@email.com'
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email})
    expect(res.status).toBe(400)
    // Make sure the user is not created.
    const result = await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `)
    expect(result).toEqual([])
  })

  test('should return 409 if email is already registered and activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    // Create activated user.
    await db.query(sql`
      INSERT INTO users (
        email,
        password,
        is_activated
      )
      VALUES (
        ${email},
        ${password},
        true
      );
    `)
    // Signup the user again and check error response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email, password})
    // Make sure the user is not updated.
    expect(res.status).toBe(409)
  })

  test('should create un-activated user and send signup confirmation email if email is not registered yet', async () => {
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

  test('should overwrite password and send signup confirmation email if email is already registered but not activated', async () => {
    const mockMailServerSend = mailServer.send
    const email = 'test@email.com'
    const password1 = 'password1'
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
        ${password1},
        false
      );
    `)
    // Signup the user again and check response.
    await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email, password: password2})
    // Make sure the password is updated.
    const result = await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `)
    const isNotOriginalPassword = await bcrypt.compare(password1, result[0].password)
    expect(isNotOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(password2, result[0].password)
    expect(isUpdatedPassword).toBe(true)
    // Make sure a signup confirmation email is sent.
    expect(mockMailServerSend).toBeCalledWith(email, expect.any(String), expect.any(String), expect.any(String))
  })
})

describe(`POST ${API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path}`, () => {
  test('', async () => {

  })

  test('', async () => {

  })
})

describe(`POST ${API_PATHS.AUTH.LOGIN.path}`, () => {
  test('should return 400 if email does not exist', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: 'test', password: 'test' })
    expect(res.status).toBe(400)
  })
})

describe(`POST ${API_PATHS.AUTH.EDIT.path}`, () => {
  // TODO: Test if authApiMiddleware is working.

  test('', async () => {

  })

  test('', async () => {

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
