import getConnectionPool, {sql, ConnectionPool} from '../database';
import { v4 as uuidv4 } from 'uuid'

let db: ConnectionPool

let user1Id: number
let user2Id: number
let deletedUserId: number
let userWithoutAnyDocumentId: number
const prepareUsers = async () => {
  // Initialize users table.
  await db.query(sql`
    DELETE FROM users;
  `)
  const user1Email = 'user1@test.com'
  const user2Email = 'user2@test.com'
  const deletedUserEmail = 'deleted@test.com'
  const userWithoutAnyDocumentEmail = 'userWithoutAnyDocument@test.com'
  // Create users.
  await db.query(sql`
    CALL create_user(${user1Email}, 'password1');
  `)
  await db.query(sql`
    CALL create_user(${user2Email}, 'password2');
  `)
  await db.query(sql`
    CALL create_user(${deletedUserEmail}, 'deletedPassword');
  `)
  await db.query(sql`
    CALL create_user(${userWithoutAnyDocumentEmail}, 'userWithoutAnyDocumentPassword');
  `)
  // Get id.
  user1Id = (await db.query(sql`
    SELECT id
      FROM users
      WHERE email = ${user1Email};
  `))[0].id
  user2Id = (await db.query(sql`
    SELECT id
      FROM users
      WHERE email = ${user2Email};
  `))[0].id
  deletedUserId = (await db.query(sql`
    SELECT id
      FROM users
      WHERE email = ${deletedUserEmail};
  `))[0].id
  await db.query(sql`
    DELETE
      FROM users
      WHERE id = ${deletedUserId};
  `)
  userWithoutAnyDocumentId = (await db.query(sql`
    SELECT id
      FROM users
      WHERE email = ${userWithoutAnyDocumentEmail};
  `))[0].id
}

type DocumentOnDB = {
  id: string
  user_id: number
  name: string
  content: string
  created_at: Date
  updated_at: Date
  is_deleted: 0 | 1
}
let user1Document1: DocumentOnDB
let user1Document2: DocumentOnDB
let user2Document1: DocumentOnDB
let user2Document2: DocumentOnDB
/** Canceling timezone offset is needed only when inserting DATETIME value on test. */
const timezoneOffsetStr = (() => {
  const rowOffset = new Date().getTimezoneOffset()
  const offsetMinutes = rowOffset % 60
  const offsetHour = (rowOffset - offsetMinutes) / 60
  const offsetIsPositive = offsetHour >= 0
  const offsetHourAbs = Math.abs(offsetHour)
  const makeTwoDigits = (value: number): string => String(value).padStart(2, '0')
  return `${offsetIsPositive ? '+' : '-'}${makeTwoDigits(offsetHourAbs)}:${makeTwoDigits(offsetMinutes)}`
})()
/** @returns {string} YYYY-MM-DD HH:MM:SS.SSS+00:00 */
const buildDatetimeStrForTest = (datetime: Date): string => {
  return `${datetime.toISOString().slice(0, -1).replace('T', ' ')}${timezoneOffsetStr}`
}
const initializeDocuments = async () => {
  // Reset documents table.
  await db.query(sql`
    DELETE FROM documents;
  `)
  // Prepare documents.
  user1Document1 = {
    id: uuidv4(),
    user_id: user1Id,
    name: "User 1's document #1",
    content: "This is user 1's document #1.",
    created_at: new Date("2000-01-01T01:00:00.000Z"),
    updated_at: new Date("2000-01-02T01:00:00.000Z"),
    is_deleted: 0
  }
  await db.query(sql`
    INSERT INTO documents (
			id,
			user_id,
			name,
			content,
			created_at,
			updated_at,
			is_deleted
    )
    VALUES (
      ${user1Document1.id},
      ${user1Document1.user_id},
      ${user1Document1.name},
      ${user1Document1.content},
      ${buildDatetimeStrForTest(user1Document1.created_at)},
      ${buildDatetimeStrForTest(user1Document1.updated_at)},
      false
    );
  `)
  user1Document2 = {
    id: uuidv4(),
    user_id: user1Id,
    name: "User 1's document #2",
    content: "This is user 1's document #2.",
    created_at: new Date("2000-01-01T02:00:00.000Z"),
    updated_at: new Date("2000-01-02T02:00:00.000Z"),
    is_deleted: 0
  }
  await db.query(sql`
    INSERT INTO documents (
			id,
			user_id,
			name,
			content,
			created_at,
			updated_at,
			is_deleted
    )
    VALUES (
      ${user1Document2.id},
      ${user1Document2.user_id},
      ${user1Document2.name},
      ${user1Document2.content},
      ${buildDatetimeStrForTest(user1Document2.created_at)},
      ${buildDatetimeStrForTest(user1Document2.updated_at)},
      false
    );
  `)
  user2Document1 = {
    id: uuidv4(),
    user_id: user2Id,
    name: "User 2's document #1",
    content: "This is user 2's document #1.",
    created_at: new Date("2000-01-01T01:30:00.000Z"),
    updated_at: new Date("2000-01-02T01:30:00.000Z"),
    is_deleted: 0
  }
  await db.query(sql`
    INSERT INTO documents (
			id,
			user_id,
			name,
			content,
			created_at,
			updated_at,
			is_deleted
    )
    VALUES (
      ${user2Document1.id},
      ${user2Document1.user_id},
      ${user2Document1.name},
      ${user2Document1.content},
      ${buildDatetimeStrForTest(user2Document1.created_at)},
      ${buildDatetimeStrForTest(user2Document1.updated_at)},
      false
    );
  `)
  user2Document2 = {
    id: uuidv4(),
    user_id: user2Id,
    name: "User 2's document #2",
    content: "This is user 2's document #2.",
    created_at: new Date("2000-01-01T02:30:00.000Z"),
    updated_at: new Date("2000-01-02T02:30:00.000Z"),
    is_deleted: 0
  }
  await db.query(sql`
    INSERT INTO documents (
			id,
			user_id,
			name,
			content,
			created_at,
			updated_at,
			is_deleted
    )
    VALUES (
      ${user2Document2.id},
      ${user2Document2.user_id},
      ${user2Document2.name},
      ${user2Document2.content},
      ${buildDatetimeStrForTest(user2Document2.created_at)},
      ${buildDatetimeStrForTest(user2Document2.updated_at)},
      false
    );
  `)
}

beforeAll(async () => {
  db = getConnectionPool()
  return await prepareUsers()
})
beforeEach(() => {
  return initializeDocuments()
})
afterAll(() => {
  return db.dispose()
})

describe('get_documents', () => {
  test('gets every document of given user if after property is not provided', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_documents(${user1Id}, NULL);
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([user1Document2, user1Document1])
  })

  test('gets every document updated after the value of after property of given user if after property is provided', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_documents(${user1Id}, ${buildDatetimeStrForTest(new Date("2000-01-02T01:30:00.000Z"))});
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([user1Document2])
  })
})

describe('update_document', () => {
  test('updates an existing document if a document with given id and user_id exists', async () => {
    const newName = "User 1's document #1 UPDATED"
    const newContent = "This is user 1's document #1 UPDATED."
    const newUpdatedAt = new Date("2000-01-03T01:00:00.000Z")
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Document1.user_id},
        ${newName},
        ${newContent},
        ${buildDatetimeStrForTest(user1Document1.created_at)},
        ${buildDatetimeStrForTest(newUpdatedAt)},
        false
      );
    `)
    // EXPECTED RESULT
    const result = (await db.query(sql`
      SELECT *
        FROM documents
        WHERE id = ${user1Document1.id};
    `))[0]
    expect(result).toEqual({
      id: user1Document1.id,
      user_id: user1Document1.user_id,
      name: newName,
      content: newContent,
      created_at: user1Document1.created_at,
      updated_at: newUpdatedAt,
      is_deleted: 0
    })
  })

  test('inserts a new document if given id not exists', async () => {
    const newDocument: DocumentOnDB = {
      id: uuidv4(),
      user_id: user1Id,
      name: "New document",
      content: "This is a new document.",
      created_at: new Date("2000-01-03T01:00:00.000Z"),
      updated_at: new Date("2000-01-03T01:00:00.000Z"),
      is_deleted: 0
    }
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_document(
        ${newDocument.id},
        ${newDocument.user_id},
        ${newDocument.name},
        ${newDocument.content},
        ${buildDatetimeStrForTest(newDocument.created_at)},
        ${buildDatetimeStrForTest(newDocument.updated_at)},
        false
      );
    `)
    // EXPECTED RESULT
    const result = (await db.query(sql`
      SELECT *
        FROM documents
        WHERE id = ${newDocument.id};
    `))[0]
    expect(result).toEqual(newDocument)
  })

  test('returns error if given user id not exists', async () => {
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL update_document(
        ${uuidv4()},
        ${deletedUserId},
        "New document",
        "This is a new document.",
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        false
      );
    `)).rejects.toEqual(new Error('User does not exist.'))
  })

  test('returns error if a document with given id exists but it has a user_id other than the given one', async () => {
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user2Document1.user_id},
        "New document",
        "This is a new document.",
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        false
      );
    `)).rejects.toEqual(new Error("Another user's document is using the same id."))
  })

  test('sets null to every column other than updated_at if given is_deleted is true', async () => {
    const updatedAt = new Date("2000-01-03T01:00:00.000Z")
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Document1.user_id},
        "This title will not saved on database",
        "This content will not saved on database.",
        ${buildDatetimeStrForTest(user1Document1.created_at)},
        ${buildDatetimeStrForTest(updatedAt)},
        true
      );
    `)
    // EXPECTED RESULT
    const result = (await db.query(sql`
      SELECT *
        FROM documents
        WHERE id = ${user1Document1.id};
    `))[0]
    expect(result).toEqual({
      id: user1Document1.id,
      user_id: user1Document1.user_id,
      name: null,
      content: null,
      created_at: null,
      updated_at: updatedAt,
      is_deleted: 1
    })
  })
})

describe('get_latest_update_time', () => {
  test('returns latest update time of given user', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_latest_update_time(
        ${user1Id}
      );
    `))[0]
    const gotTime = result[0].updated_at
    // EXPECTED RESULT
    expect(gotTime).toEqual(user1Document2.updated_at)
  })

  test('returns error if given user not exists', async () => {
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL get_latest_update_time(
        ${deletedUserId}
      );
    `)).rejects.toEqual(new Error('User does not exist.'))
  })

  test('returns empty array if given user does not have any document', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_latest_update_time(
        ${userWithoutAnyDocumentId}
      );
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([])
  })
})
