import getConnectionPool, {sql, ConnectionPool} from '../database';

let db: ConnectionPool
beforeAll(() => {
  db = getConnectionPool()
})
afterAll(() => {
  return db.dispose()
})

beforeEach(() => {
  return db.query(sql`
    DELETE FROM users;
  `)
})

describe('create_user', () => {
  test('creates un-activated user', async () => {
    const email = 'test@email.com'
    const hashedPassword = 'hashed-password'
    // TESTED PROCEDURE
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
    // EXPECTED RESULT
    const result = (await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `))[0]
    expect(result).toEqual({
      "id": expect.any(Number),
      "email": email,
      "is_activated": 0,
      "hashed_password": hashedPassword,
    })
  })

  test('overwrites the password if given email of un-activated user', async () => {
    const email = 'test@email.com'
    const hashedPassword1 = 'hashed-password1'
    const hashedPassword2 = 'hashed-password2'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword1});
    `)
    // TESTED PROCEDURE
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword2});
    `)
    // EXPECTED RESULT
    const result = (await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `))[0]
    expect(result).toEqual({
      "id": expect.any(Number),
      "email": email,
      "is_activated": 0,
      "hashed_password": hashedPassword2,
    })
  })

  test('returns error if given email of activated user', async () => {
    const email = 'test@email.com'
    const hashedPassword = 'hashed-password'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
    // Activate the user.
    await db.query(sql`
      CALL activate_user(${email});
    `)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)).rejects.toEqual(new Error('Activated user with given email already exists.'))
  })
})

describe('activate_user', () => {
  test('activate user if un-activated user exists with given email', async () => {
    const email = 'test@email.com'
    const hashedPassword = 'hashed-password'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
    // TESTED PROCEDURE
    await db.query(sql`
      CALL activate_user(${email});
    `)
    // EXPECTED RESULT
    const result = (await db.query(sql`
      SELECT *
        FROM users
        WHERE email = ${email};
    `))[0]
    expect(result).toEqual({
      "id": expect.any(Number),
      "email": email,
      "is_activated": 1, // This is what we expect.
      "hashed_password": hashedPassword,
    })
  })

  test('returns error if any user with given email does not exist', async () => {
    const email = 'test@email.com'
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL activate_user(${email});
    `)).rejects.toEqual(new Error('User does not exist.'))
  })

  test('returns error if activated user exists with given email', async () => {
    const email = 'test@email.com'
    const hashedPassword = 'hashed-password'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
    // Activate the user.
    await db.query(sql`
      CALL activate_user(${email});
    `)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL activate_user(${email});
    `)).rejects.toEqual(new Error('User already activated.'))
  })
})

describe('get_user', () => {
  test('returns a user if the user with the given email exists', async () => {
    const email = 'test@email.com'
    const hashedPassword = 'hashed-password'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_user(${email});
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([{
      "id": expect.any(Number),
      "email": email,
      "is_activated": 0,
      "hashed_password": hashedPassword,
    }])
  })

  test('returns empty array if the user with the given email not exists', async () => {
    const email = 'test@email.com'
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_user(${email});
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([])
  })
})

describe('update_user', () => {
  test('updates email of the user with given id if new email is provided', async () => {
    const email1 = 'test1@email.com'
    const email2 = 'test2@email.com'
    const hashedPassword = 'hashed-password'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email1}, ${hashedPassword});
    `)
    // Get id.
    const createdId = (await db.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email1};
    `))[0].id
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_user(${createdId}, ${email2}, NULL);
    `)
    // EXPECTED RESULT
    expect((await db.query(sql`
      SELECT email
        FROM users
        WHERE id = ${createdId};
    `))[0].email).toBe(email2)
  })

  test('updates password of the user with given id if new password is provided', async () => {
    const email = 'test@email.com'
    const hashedPassword1 = 'hashed-password1'
    const hashedPassword2 = 'hashed-password2'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword1});
    `)
    // Get id.
    const createdId = (await db.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email};
    `))[0].id
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_user(${createdId}, NULL, ${hashedPassword2});
    `)
    // EXPECTED RESULT
    expect((await db.query(sql`
      SELECT hashed_password
        FROM users
        WHERE id = ${createdId};
    `))[0].hashed_password).toBe(hashedPassword2)
  })
})

describe('delete_user', () => {
  test('deletes user with given id if exists', async () => {
    const email = 'test@email.com'
    const hashedPassword = 'hashed-password'
    // Create a user.
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
    // Get id.
    const createdId = (await db.query(sql`
      SELECT id
        FROM users
        WHERE email = ${email};
    `))[0].id
    // TESTED PROCEDURE
    await db.query(sql`
      CALL delete_user(${createdId});
    `)
    // EXPECTED RESULT
    expect(
      await db.query(sql`
        SELECT *
          FROM users
          WHERE email = ${email};
    `)
    ).toEqual([])
  })

  test('returns error if user with given id does not exist', async () => {
    const id = 1
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL delete_user(${id});
    `)).rejects.toEqual(new Error('User does not exist.'))
  })
})
