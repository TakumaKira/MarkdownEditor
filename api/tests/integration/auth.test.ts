import request from 'supertest'
import { API_PATHS, REDIS_KEYS, SESSION_SID_KEY, WS_HANDSHAKE_TOKEN_KEY } from '../../src/constants'
import { JWT_SECRET_KEY } from '../../src/getEnvs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { assertSession, apiAppForTest, retrieveSessionId, waitForShutdown, sleep } from '../utils'
import cookie from 'cookie'
import getMailServer from '../../src/services/mailServer'
import { getRedisKeyName } from '../../src/services/sessionStorage'
import { DocumentsUpdateRequest } from '../../src/models/document'
import { io } from 'socket.io-client'
import { TESTING_WS_SERVER_AP } from '../constants'

beforeAll(async () => {
  await apiAppForTest.setup()
})
afterAll(async () => {
  await apiAppForTest.close()
  await waitForShutdown()
})

beforeEach(async () => {
  // Initialize users table.
  await dbClient.query(sql`
    DELETE FROM users;
  `)
})
afterEach(async () => {
  return
})

describe(`POST ${API_PATHS.AUTH.SIGNUP.path}`, () => {
  test('returns 400 if email and password are not provided on request body', async () => {
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"email\" is required")
  })

  test('returns 400 if email is not provided on request body', async () => {
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"email\" is required")
  })

  test('returns 400 if password is not provided on request body and new user does not be created', async () => {
    const email = 'test@email.com'
    // Post and check response.
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"password\" is required")
    // Make sure the user is not created.
    const result = await dbClient.query(sql`
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
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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
    const mockMailServerSend = getMailServer().send
    const email = 'test@email.com'
    const password = 'password'
    // Signup a user and check response.
    await request(apiApp)
      .post(API_PATHS.AUTH.SIGNUP.path)
      .send({email, password})
    // Make sure if the un-activated user is created.
    const result = await dbClient.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `)
    expect(result).toEqual([{
      id: expect.any(Number),
      email,
      hashed_password: expect.any(String),
      is_activated: 0
    }])
    const isRegisteredPassword = await bcrypt.compare(password, result[0].hashed_password)
    expect(isRegisteredPassword).toBe(true)
    // Make sure a signup confirmation email is sent.
    expect(mockMailServerSend).toBeCalledWith(email, expect.any(String), expect.any(String), expect.any(String))
  })

  test('overwrites password and send signup confirmation email if email is already registered but not activated', async () => {
    const mockMailServerSend = getMailServer().send
    const email = 'test@email.com'
    const password1 = 'password1'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword1 = await bcrypt.hash(password1, salt)
    const password2 = 'password2'
    // Create un-activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE email = ${email};
    `)
    const isOriginalPassword = await bcrypt.compare(password1, result[0].hashed_password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(password2, result[0].hashed_password)
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
    expect(resForUndefined.body.message).toBe("\"token\" is required")

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe("\"token\" is required")
  })

  test('returns 400 if token did not encoded with correct secret', async () => {
    const tokenWithIncorrectSecret = jwt.sign(
      {is: 'SignupToken', email: 'test@email.com'},
      `${JWT_SECRET_KEY}1`
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token: tokenWithIncorrectSecret})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if token does not have email', async () => {
    const tokenWithoutEmail = jwt.sign(
      {is: 'SignupToken'},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token: tokenWithoutEmail})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if token is not SignupToken', async () => {
    const token = jwt.sign(
      {is: 'ResetPasswordToken', email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if the email does not exist', async () => {
    const token = jwt.sign(
      {is: 'SignupToken', email: 'test@email.com'},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('The email you are trying to confirm does not exist on database.')
  })

  test('returns 409 if the email is already activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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
      {is: 'SignupToken', email},
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
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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
      {is: 'SignupToken', email},
      JWT_SECRET_KEY
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path)
      .send({token})
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(email)
    await assertSession(res, email)
  })
})

describe(`POST ${API_PATHS.AUTH.LOGIN.path}`, () => {
  test('returns 400 if email and password are not provided on request body', async () => {
    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe("\"email\" is required")

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe("\"email\" is required")
  })

  test('returns 400 if email is not provided on request body', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"email\" is required")
  })

  test('returns 400 if password is not provided on request body', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({email: 'test@email.com'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"password\" is required")
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
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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

  test('returns 200 with valid session cookie if email and password are correct and user is activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
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
    await assertSession(res, email)
    // Send next request with gotten session cookie
    const nextRequestRes = await request(apiApp)
      .post(API_PATHS.DOCUMENTS.path)
      .set('Cookie', res.headers['set-cookie'])
      .send({ updates: [] } as DocumentsUpdateRequest)
    expect(nextRequestRes.status).toBe(200)
    // Connect WebSocket server with gotten wsHandshakeToken
    const wsClientSocket = io(TESTING_WS_SERVER_AP, {
      autoConnect: false,
      auth: {wsHandshakeToken: nextRequestRes.headers[WS_HANDSHAKE_TOKEN_KEY]}
    })
    const onConnect = jest.fn()
    wsClientSocket.on('connect', onConnect)
    wsClientSocket.connect()
    await sleep(500)
    try {
      expect(onConnect).toHaveBeenCalled()
    } finally {
      wsClientSocket.disconnect()
    }
  })
})

describe(`POST ${API_PATHS.AUTH.LOGOUT.path}`, () => {
  test('returns 200 while deleting the session', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    const loginRes = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password })
    const setCookieHeaders: string[] = loginRes.headers['set-cookie']
    const cookies = setCookieHeaders.map(headerValue => cookie.parse(headerValue))
    const sessionCookieIndex = cookies.findIndex((cookie: any) => cookie.hasOwnProperty(SESSION_SID_KEY))
    const connectSid: string | undefined = cookies[sessionCookieIndex]?.[SESSION_SID_KEY]
    const sessionId = retrieveSessionId(connectSid)
    expect(sessionId).toBeTruthy()
    const wsHandshakeToken = loginRes.headers[WS_HANDSHAKE_TOKEN_KEY]
    expect(wsHandshakeToken).toBeTruthy()
    const sessionStrInSessionStorage = await sessionStorageClient.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId!))
    expect(sessionStrInSessionStorage).toBeTruthy()
    const wsHandshakeTokenToSessionIdMapValueInSessionStorage = await sessionStorageClient.get(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken!))
    expect(wsHandshakeTokenToSessionIdMapValueInSessionStorage).toBeTruthy()
    const logoutRes = await request(apiApp)
      .post(API_PATHS.AUTH.LOGOUT.path)
      .set('Cookie', setCookieHeaders)
    expect(logoutRes.status).toBe(200)
    const sessionStrInSessionStorageAfterLogout = await sessionStorageClient.get(getRedisKeyName(REDIS_KEYS.SESSION, sessionId!))
    expect(sessionStrInSessionStorageAfterLogout).toBeFalsy()
    const wsHandshakeTokenToSessionIdMapValueInSessionStorageAfterLogout = await sessionStorageClient.get(getRedisKeyName(REDIS_KEYS.WS_HANDSHAKE_TOKEN, wsHandshakeToken!))
    expect(wsHandshakeTokenToSessionIdMapValueInSessionStorageAfterLogout).toBeFalsy()
    // Make sure the previous session and wsHandshakeToken does not work anymore.
    const nextRequestRes = await request(apiApp)
      .post(API_PATHS.DOCUMENTS.path)
      .set('Cookie', setCookieHeaders)
      .send({ updates: [] } as DocumentsUpdateRequest)
    expect(nextRequestRes.status).toBe(401)
    const wsClientSocket = io(TESTING_WS_SERVER_AP, {
      autoConnect: false,
      auth: {wsHandshakeToken: loginRes.headers[WS_HANDSHAKE_TOKEN_KEY]}
    })
    const onConnectError = jest.fn()
    wsClientSocket.on('connect_error', onConnectError)
    wsClientSocket.connect()
    await sleep(500)
    try {
      expect(onConnectError).toHaveBeenCalledWith(new Error('Access denied. Handshake request does not have valid token.'))
    } finally {
      wsClientSocket.disconnect()
    }
  })
})

describe(`POST ${API_PATHS.AUTH.EDIT.path}`, () => {
  test('returns 401 without updating email nor password if apiAuthMiddleware deny access', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail};
    `))[0].id

    const resForNoSet = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .send({ email: newEmail, password: newPassword })
    expect(resForNoSet.status).toBe(401)
    expect(resForNoSet.body.message).toBe('Access denied. Request is not authorized.')

    const resForEmptyArray = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', [])
      .send({ email: newEmail, password: newPassword })
    expect(resForEmptyArray.status).toBe(401)
    expect(resForEmptyArray.body.message).toBe('Access denied. Request is not authorized.')
    // Make sure email and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('returns 401 without updating email nor password if no session cookie provided', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail};
    `))[0].id

    const resForNoSet = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .send({ email: newEmail, password: newPassword })
    expect(resForNoSet.status).toBe(401)
    expect(resForNoSet.body.message).toBe('Access denied. Request is not authorized.')

    const resForEmptyArray = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', [])
      .send({ email: newEmail, password: newPassword })
    expect(resForEmptyArray.status).toBe(401)
    expect(resForEmptyArray.body.message).toBe('Access denied. Request is not authorized.')
    // Make sure email and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('returns 401 without updating email nor password if session cookie is not valid', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail};
    `))[0].id

    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: oldEmail, password: oldPassword })
    const setCookieHeaders: string[] = resLogin.headers['set-cookie']
    const cookies = setCookieHeaders.map(headerValue => cookie.parse(headerValue))
    const sessionCookieIndex = cookies.findIndex((cookie: any) => cookie.hasOwnProperty(SESSION_SID_KEY))
    const connectSid: string | undefined = cookies[sessionCookieIndex]?.[SESSION_SID_KEY];
    const validSessionSid = connectSid.match(/s:([^\.]+)/)?.[1]
    const invalidCookie: string[] = [setCookieHeaders[0].replace(validSessionSid!, `${validSessionSid}1`)]

    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', invalidCookie)
      .send({ email: newEmail, password: newPassword })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Access denied. Request is not authorized.')
    // Make sure email and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('returns 400 without updating email nor password if both email and password is missing', async () => {
    const oldEmail = 'old@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail};
    `))[0].id

    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: oldEmail, password: oldPassword })
    const validCookie: string[] = resLogin.headers['set-cookie']

    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', validCookie)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe("\"value\" must have at least 1 key")

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', validCookie)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe("\"value\" must have at least 1 key")
    // Make sure email and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('sends confirmation mail if only new email is provided and returns message', async () => {
    const mockMailServerSend = getMailServer().send
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail};
    `))[0].id

    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: oldEmail, password: oldPassword })
    const validCookie: string[] = resLogin.headers['set-cookie']

    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', validCookie)
      .send({email: newEmail})
    expect(mockMailServerSend).toBeCalledWith(newEmail, expect.any(String), expect.any(String), expect.any(String))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe(`Confirmation email was sent to ${newEmail}. Please check the inbox and confirm.`)
    // Make sure email is not updated yet and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('updates password and returns password update success message if only new password is provided', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id as number
    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password: oldPassword })
    const validCookie: string[] = resLogin.headers['set-cookie']
    const newPassword = 'newPassword'
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', validCookie)
      .send({password: newPassword})
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Password update successful.')
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(email)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(true)
  })

  test('updates only password and sends confirmation mail if both new email and new password is provided', async () => {
    const mockMailServerSend = getMailServer().send
    const oldEmail = 'old@email.com'
    const oldPassword = 'oldPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email: oldEmail, password: oldPassword })
    const validCookie: string[] = resLogin.headers['set-cookie']
    const newEmail = 'new@email.com'
    const newPassword = 'newPassword'
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.EDIT.path)
      .set('Cookie', validCookie)
      .send({email: newEmail, password: newPassword})
    expect(mockMailServerSend).toBeCalledWith(newEmail, expect.any(String), expect.any(String), expect.any(String))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe(`Confirmation email was sent to ${newEmail}. Please check the inbox and confirm.`)
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(true)
  })
})

describe(`POST ${API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path}`, () => {
  test('returns 400 if token and password are missing on request body', async () => {
    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe("\"token\" is required")

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe("\"token\" is required")
  })

  test('returns 400 if token is missing on request body', async () => {
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"token\" is required")
  })

  test('returns 400 without updating email if password is missing on request body', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const token = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"password\" is required")
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 without updating email if token is expired', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const expiredToken = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail},
      JWT_SECRET_KEY,
      {expiresIn: '0ms'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: expiredToken, password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Token expired. Please try again.')
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 without updating email if token is invalid', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const token = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: `${token}1`, password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 without updating email if token is not encoded with correct secret', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const tokenWithIncorrectSecret = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail},
      `${JWT_SECRET_KEY}1`,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: tokenWithIncorrectSecret, password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 without updating email if token is not EmailChangeToken', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const tokenWithIncorrectSecret = jwt.sign(
      {is: 'SignupToken', oldEmail, newEmail},
      `${JWT_SECRET_KEY}1`,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: tokenWithIncorrectSecret, password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 if token does not have old email', async () => {
    const tokenWithoutOldEmail = jwt.sign(
      {is: 'EmailChangeToken', newEmail: 'new@email.com'},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: tokenWithoutOldEmail, password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if token does not have new email', async () => {
    const oldEmail = 'old@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const tokenWithoutNewEmail = jwt.sign(
      {is: 'EmailChangeToken', oldEmail},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: tokenWithoutNewEmail, password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 if token does not have old email and new email', async () => {
    const tokenWithoutOldEmailAndNewEmail = jwt.sign(
      {is: 'EmailChangeToken'},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token: tokenWithoutOldEmailAndNewEmail, password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if user with oldEmail does not exist', async () => {
    const oldEmail = 'old@email.com'
    const token = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail: 'new@email.com'},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token, password: 'password'})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe(`User with email: ${oldEmail} does not exist.`)
  })

  test('returns 400 without updating email if user with oldEmail is not activated and does not update email', async () => {
    const oldEmail = 'old@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        false
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id
    const token = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail: 'new@email.com'},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token, password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe(`User with email ${oldEmail} is not activated yet. Please activate then retry.`)
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('returns 400 without updating email if password is incorrect and does not update email', async () => {
    const oldEmail = 'old@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id
    const token = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail: 'new@email.com'},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token, password: `${password}1`})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Password is incorrect.')
    // Make sure email is not updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(oldEmail)
  })

  test('updates email and returns 200 with valid session cookie if there is no problem on entire process', async () => {
    const oldEmail = 'old@email.com'
    const newEmail = 'new@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${oldEmail},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${oldEmail}
    `))[0].id

    const token = jwt.sign(
      {is: 'EmailChangeToken', oldEmail, newEmail},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path)
      .send({token, password})
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Email change successful.')
    expect(res.body.email).toBe(newEmail)
    await assertSession(res, newEmail)
    // Make sure email is updated.
    const result = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(newEmail)
  })
})

describe(`POST ${API_PATHS.AUTH.RESET_PASSWORD.path}`, () => {
  test('returns 400 if request does not have email', async () => {
    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.RESET_PASSWORD.path)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe("\"email\" is required")

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.RESET_PASSWORD.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe("\"email\" is required")
  })

  test('returns 400 if user with given email does not exist', async () => {
    const email = 'test@email.com'
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.RESET_PASSWORD.path)
      .send({email})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe(`There is no user with email: ${email}`)
  })

  test('returns 400 if user with given email is not activated', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        false
      );
    `)
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.RESET_PASSWORD.path)
      .send({email})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('This user is not activated.')
  })

  test('sends confirmation mail if there is no problem', async () => {
    const mockMailServerSend = getMailServer().send
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.RESET_PASSWORD.path)
      .send({email})
    expect(mockMailServerSend).toBeCalledWith(email, expect.any(String), expect.any(String), expect.any(String))
    expect(res.status).toBe(200)
    expect(res.body.message).toBe(`Confirmation email was sent to ${email}. Please check the inbox and confirm.`)
  })
})

describe(`POST ${API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path}`, () => {
  test('returns 400 if request does not have token and password', async () => {
    const resForUndefined = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send()
    expect(resForUndefined.status).toBe(400)
    expect(resForUndefined.body.message).toBe("\"token\" is required")

    const resForEmptyObject = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({})
    expect(resForEmptyObject.status).toBe(400)
    expect(resForEmptyObject.body.message).toBe("\"token\" is required")
  })

  test('returns 400 if request does not have token', async () => {
    const password = 'password'
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({password})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"token\" is required")
  })

  test('returns 400 without updating password if request does not have password', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id

    const token = jwt.sign(
      {is: 'ResetPasswordToken', email},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("\"password\" is required")
    // Make sure password is not updated.
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
  })

  test('returns 400 without updating password if token is invalid', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id

    const token = jwt.sign(
      {is: 'ResetPasswordToken', email},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token: `${token}1`, password: newPassword})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure password is not updated.
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('returns 400 without updating password if token is encoded with incorrect secret', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id

    const tokenWithIncorrectSecret = jwt.sign(
      {is: 'ResetPasswordToken', email},
      `${JWT_SECRET_KEY}1`,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token: tokenWithIncorrectSecret, password: newPassword})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure password is not updated.
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('returns 400 without updating password if token is not ResetPasswordToken', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id

    const token = jwt.sign(
      {is: 'SignupToken', email},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token, password: newPassword})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
    // Make sure password is not updated.
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('returns 400 if token does not have email', async () => {
    const newPassword = 'newPassword'
    const token = jwt.sign(
      {is: 'SignupToken'},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token, password: newPassword})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid token.')
  })

  test('returns 400 if user with email on token does not exist', async () => {
    const email = 'test@email.com'
    const newPassword = 'newPassword'

    const token = jwt.sign(
      {is: 'ResetPasswordToken', email},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token, password: newPassword})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe(`User with email: ${email} does not exist.`)
  })

  test('returns 400 without updating password if user with email on token is not activated', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        false
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id

    const token = jwt.sign(
      {is: 'ResetPasswordToken', email},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token, password: newPassword})
    expect(res.status).toBe(400)
    expect(res.body.message).toBe(`User with email ${email} is not activated yet. Please activate then retry.`)
    // Make sure password is not updated.
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(false)
  })

  test('updates password and returns valid token if there is no problem', async () => {
    const email = 'test@email.com'
    const oldPassword = 'oldPassword'
    const newPassword = 'newPassword'
    const salt = await bcrypt.genSalt(10)
    const hashedOldPassword = await bcrypt.hash(oldPassword, salt)
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedOldPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email}
    `))[0].id

    const token = jwt.sign(
      {is: 'ResetPasswordToken', email},
      JWT_SECRET_KEY,
      {expiresIn: '30m'}
    )
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path)
      .send({token, password: newPassword})
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Password reset successful.')
    expect(res.body.email).toBe(email)
    // Make sure password is updated.
    const result = await dbClient.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${id};
    `)
    const isOriginalPassword = await bcrypt.compare(oldPassword, result[0].hashed_password)
    expect(isOriginalPassword).toBe(false)
    const isUpdatedPassword = await bcrypt.compare(newPassword, result[0].hashed_password)
    expect(isUpdatedPassword).toBe(true)
  })
})

describe(`POST ${API_PATHS.AUTH.DELETE.path}`, () => {
  test('returns 401 without deleting user if no session cookie provided', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email};
    `))[0].id

    const resForNoSet = await request(apiApp)
      .post(API_PATHS.AUTH.DELETE.path)
      .send()
    expect(resForNoSet.status).toBe(401)
    expect(resForNoSet.body.message).toBe('Access denied. Request is not authorized.')

    const resForEmptyArray = await request(apiApp)
      .post(API_PATHS.AUTH.DELETE.path)
      .set('Cookie', [])
      .send()
    expect(resForEmptyArray.status).toBe(401)
    expect(resForEmptyArray.body.message).toBe('Access denied. Request is not authorized.')
    // Make sure email and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(email)
    const isOriginalPassword = await bcrypt.compare(password, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
  })

  test('returns 401 without deleting user if session cookie is not valid', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    const id = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email};
    `))[0].id

    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password })
    const setCookieHeaders: string[] = resLogin.headers['set-cookie']
    const cookies = setCookieHeaders.map(headerValue => cookie.parse(headerValue))
    const sessionCookieIndex = cookies.findIndex((cookie: any) => cookie.hasOwnProperty(SESSION_SID_KEY))
    const connectSid: string | undefined = cookies[sessionCookieIndex]?.[SESSION_SID_KEY];
    const validSessionSid = connectSid.match(/s:([^\.]+)/)?.[1]
    const invalidCookie: string[] = [setCookieHeaders[0].replace(validSessionSid!, `${validSessionSid}1`)]

    const res = await request(apiApp)
      .post(API_PATHS.AUTH.DELETE.path)
      .set('Cookie', invalidCookie)
      .send()
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Access denied. Request is not authorized.')
    // Make sure email and password is not updated.
    const result = await dbClient.query(sql`
      SELECT email, hashed_password
        FROM users
        WHERE id = ${id};
    `)
    expect(result[0].email).toBe(email)
    const isOriginalPassword = await bcrypt.compare(password, result[0].hashed_password)
    expect(isOriginalPassword).toBe(true)
  })

  test('returns 400 if user does not exist', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password })
    const validCookie: string[] = resLogin.headers['set-cookie']
    // Delete the user.
    await dbClient.query(sql`
      DELETE FROM users
        WHERE email = ${email};
    `)
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.DELETE.path)
      .set('Cookie', validCookie)
      .send()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('The email you are trying to delete does not exist on database.')
  })

  test('deletes user and its documents if exists', async () => {
    const email = 'test@email.com'
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // Create activated user.
    await dbClient.query(sql`
      INSERT INTO users (
        email,
        hashed_password,
        is_activated
      )
      VALUES (
        ${email},
        ${hashedPassword},
        true
      );
    `)
    const userId = (await dbClient.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email};
    `))[0].id
    // Create document of the user.
    const documentId = uuidv4()
    const documentInsertResult = await dbClient.query(sql`
      INSERT INTO documents (
        id,
        user_id,
        name,
        content,
        created_at,
        updated_at,
        saved_on_db_at,
        is_deleted
      )
      VALUES (
        ${documentId},
        ${userId},
        "Name",
        "Content",
        "2000-01-01 00:00:00",
        "2000-01-01 00:00:00",
        "2000-01-01 00:00:01",
        false
      );
    `)
    expect(documentInsertResult).toHaveProperty('affectedRows', 1)

    const resLogin = await request(apiApp)
      .post(API_PATHS.AUTH.LOGIN.path)
      .send({ email, password })
    const validCookie: string[] = resLogin.headers['set-cookie']
    const res = await request(apiApp)
      .post(API_PATHS.AUTH.DELETE.path)
      .set('Cookie', validCookie)
      .send()
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('User deleted successfully.')
    // Make sure user is deleted.
    const resultForUserSelectQuery = await dbClient.query(sql`
      SELECT email
        FROM users
        WHERE id = ${userId};
    `)
    expect(resultForUserSelectQuery).toEqual([])
    // Make sure user's document is deleted.
    const resultForDocumentSelectQuery = await dbClient.query(sql`
      SELECT *
        FROM documents
        WHERE id = ${documentId};
    `)
    expect(resultForDocumentSelectQuery).toEqual([])
  })
})
