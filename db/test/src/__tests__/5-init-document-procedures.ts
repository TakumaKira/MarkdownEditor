import { v4 as uuidv4 } from 'uuid'
import getConnectionPool, {sql, ConnectionPool} from '../database'
import { DOCUMENT_CONTENT_LENGTH_LIMIT, DOCUMENT_NAME_LENGTH_LIMIT } from '../constants'
import { DocumentFromDB } from '@api/document'

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

let user1Document1: DocumentFromDB
let user1Document2: DocumentFromDB
let user2Document1: DocumentFromDB
let user2Document2: DocumentFromDB
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
    saved_on_db_at: new Date("2000-01-02T01:00:01.000Z"),
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
			saved_on_db_at,
			is_deleted
    )
    VALUES (
      ${user1Document1.id},
      ${user1Document1.user_id},
      ${user1Document1.name},
      ${user1Document1.content},
      ${buildDatetimeStrForTest(user1Document1.created_at)},
      ${buildDatetimeStrForTest(user1Document1.updated_at)},
      ${buildDatetimeStrForTest(user1Document1.saved_on_db_at)},
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
    saved_on_db_at: new Date("2000-01-02T02:00:01.000Z"),
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
			saved_on_db_at,
			is_deleted
    )
    VALUES (
      ${user1Document2.id},
      ${user1Document2.user_id},
      ${user1Document2.name},
      ${user1Document2.content},
      ${buildDatetimeStrForTest(user1Document2.created_at)},
      ${buildDatetimeStrForTest(user1Document2.updated_at)},
      ${buildDatetimeStrForTest(user1Document2.saved_on_db_at)},
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
    saved_on_db_at: new Date("2000-01-02T01:30:01.000Z"),
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
			saved_on_db_at,
			is_deleted
    )
    VALUES (
      ${user2Document1.id},
      ${user2Document1.user_id},
      ${user2Document1.name},
      ${user2Document1.content},
      ${buildDatetimeStrForTest(user2Document1.created_at)},
      ${buildDatetimeStrForTest(user2Document1.updated_at)},
      ${buildDatetimeStrForTest(user2Document1.saved_on_db_at)},
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
    saved_on_db_at: new Date("2000-01-02T02:30:01.000Z"),
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
			saved_on_db_at,
			is_deleted
    )
    VALUES (
      ${user2Document2.id},
      ${user2Document2.user_id},
      ${user2Document2.name},
      ${user2Document2.content},
      ${buildDatetimeStrForTest(user2Document2.created_at)},
      ${buildDatetimeStrForTest(user2Document2.updated_at)},
      ${buildDatetimeStrForTest(user2Document2.saved_on_db_at)},
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

describe('get_document', () => {
  test('gets a document with given id if it exists', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_document(${user1Document1.id});
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([user1Document1])
  })

  test('does not get a document with given id if it does not exists', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_document(${user1Document1.id[0] === 'a' ? 'b' + user1Document1.id.substring(1) : 'a' + user1Document1.id.substring(1)});
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([])
  })

  test('returns every existing document if used multiple times in single query', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      SELECT *
        FROM documents
        WHERE id in (
          ${user1Document1.id},
          ${user1Document2.id},
          ${user2Document1.id},
          ${user2Document2.id}
        )
        ORDER BY updated_at DESC, saved_on_db_at DESC, created_at DESC;
    `))
    // EXPECTED RESULT
    expect(result).toEqual([
      user2Document2,
      user1Document2,
      user2Document1,
      user1Document1
    ])
  })
})

describe('get_user_documents', () => {
  test('gets every document of given user if after property is not provided', async () => {
    // TESTED PROCEDURE
    const result = (await db.query(sql`
      CALL get_user_documents(${user1Id});
    `))[0]
    // EXPECTED RESULT
    expect(result).toEqual([user1Document2, user1Document1])
  })
})

describe('update_document', () => {
  test('updates an existing document if a document with given id and user_id exists', async () => {
    const newName = "User 1's document #1 UPDATED"
    const newContent = "This is user 1's document #1 UPDATED."
    const newUpdatedAt = new Date("2000-01-03T01:00:00.000Z")
    const newSavedOnDBAt = new Date("2000-01-03T01:00:01.000Z")
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Document1.user_id},
        ${newName},
        ${newContent},
        ${buildDatetimeStrForTest(user1Document1.created_at)},
        ${buildDatetimeStrForTest(newUpdatedAt)},
        ${buildDatetimeStrForTest(newSavedOnDBAt)},
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
      saved_on_db_at: newSavedOnDBAt,
      is_deleted: 0
    })
  })

  test('inserts a new document if given id not exists', async () => {
    const newDocument: DocumentFromDB = {
      id: uuidv4(),
      user_id: user1Id,
      name: "New document",
      content: "This is a new document.",
      created_at: new Date("2000-01-03T01:00:00.000Z"),
      updated_at: new Date("2000-01-03T01:00:00.000Z"),
      saved_on_db_at: new Date("2000-01-03T01:00:01.000Z"),
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
        ${buildDatetimeStrForTest(newDocument.saved_on_db_at)},
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
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `)).rejects.toEqual(new Error('User does not exist.'))
  })

  test('returns error if a document with given id exists but it has user_id different from the given one', async () => {
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user2Document1.user_id},
        "New document",
        "This is a new document.",
        ${user1Document1.created_at},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `)).rejects.toEqual(new Error("Another user's document is using the same id."))
  })

  test('returns error if a document with given id exists but it has created_at different from the given one', async () => {
    const newCreatedAt = buildDatetimeStrForTest(new Date("2001-01-03T01:00:00.000Z"))
    expect(newCreatedAt).not.toBe(user1Document1.created_at)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Document1.user_id},
        "New document",
        "This is a new document.",
        ${newCreatedAt},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `)).rejects.toEqual(new Error("Another document of this user is using the same id."))
  })

  test('sets null to every column other than created_at and updated_at if given is_deleted is true', async () => {
    const updatedAt = new Date("2000-01-03T01:00:00.000Z")
    const savedOnDBAt = new Date("2000-01-03T01:00:01.000Z")
    // TESTED PROCEDURE
    await db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Document1.user_id},
        "This title will not saved on database",
        "This content will not saved on database.",
        ${buildDatetimeStrForTest(user1Document1.created_at)},
        ${buildDatetimeStrForTest(updatedAt)},
        ${buildDatetimeStrForTest(savedOnDBAt)},
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
      created_at: user1Document1.created_at,
      updated_at: updatedAt,
      saved_on_db_at: savedOnDBAt,
      is_deleted: 1
    })
  })

  test('inserts a new document if the name is not too long', async () => {
    const newDocumentId = uuidv4()
    const lessThanTooLongName = "a".repeat(50)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(async () => await expect(db.query(sql`
      CALL update_document(
        ${newDocumentId},
        ${user1Id},
        ${lessThanTooLongName},
        "This is a new document.",
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `))).not.toThrow()
    const result = (await db.query(sql`
      SELECT name
        FROM documents
        WHERE id = ${newDocumentId};
    `))
    expect(result).toEqual([{name: lessThanTooLongName}])
  })

  test('returns error and does not insert new document if the name is too long', async () => {
    const newDocumentId = uuidv4()
    const tooLongName = "a".repeat(51)
    // TESTED PROCEDURE
    try {
      await db.query(sql`
        CALL update_document(
          ${newDocumentId},
          ${user1Id},
          ${tooLongName},
          "This is a new document.",
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
          false
        );
      `)
    } catch (e) {
      // EXPECTED RESULT
      expect(e.code).toBe('ER_DATA_TOO_LONG')
      expect(e.errno).toBe(1406)
      expect(e.sqlState).toBe('22001')
      expect(e.sqlMessage).toBe("Data too long for column 'p_name' at row 1")
      expect(e.message).toBe("Data too long for column 'p_name' at row 1")
    }
    const result = (await db.query(sql`
      SELECT name
        FROM documents
        WHERE id = ${newDocumentId};
    `))
    expect(result).toEqual([])
  })

  test('inserts a new document if the content is not too long', async () => {
    const newDocumentId = uuidv4()
    const lessThanTooLongContent = "a".repeat(20000)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(async () => await expect(db.query(sql`
      CALL update_document(
        ${newDocumentId},
        ${user1Id},
        "New document",
        ${lessThanTooLongContent},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `))).not.toThrow()
    await new Promise(resolve => setTimeout(resolve, 100))
    const result = (await db.query(sql`
      SELECT content
        FROM documents
        WHERE id = ${newDocumentId};
    `))
    expect(result).toEqual([{content: lessThanTooLongContent}])
  })

  test('returns error and does not insert new document if the content is too long', async () => {
    const newDocumentId = uuidv4()
    const tooLongContent = "a".repeat(20001)
    // TESTED PROCEDURE
    try {
      await db.query(sql`
        CALL update_document(
          ${newDocumentId},
          ${user1Id},
          "New document",
          ${tooLongContent},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
          false
        );
      `)
    } catch (e) {
      // EXPECTED RESULT
      expect(e.code).toBe('ER_DATA_TOO_LONG')
      expect(e.errno).toBe(1406)
      expect(e.sqlState).toBe('22001')
      expect(e.sqlMessage).toBe("Data too long for column 'p_content' at row 1")
      expect(e.message).toBe("Data too long for column 'p_content' at row 1")
    }
    const result = (await db.query(sql`
      SELECT content
        FROM documents
        WHERE id = ${newDocumentId};
    `))
    expect(result).toEqual([])
  })

  test('updates document if the name is not too long', async () => {
    const lessThanTooLongName = "a".repeat(DOCUMENT_NAME_LENGTH_LIMIT)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(async () => await expect(db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Id},
        ${lessThanTooLongName},
        "This is a new document.",
        ${user1Document1.created_at},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `))).not.toThrow()
    const result = (await db.query(sql`
      SELECT name
        FROM documents
        WHERE id = ${user1Document1.id};
    `))
    expect(result).toEqual([{name: lessThanTooLongName}])
  })

  test('returns error and does not update document if the name is too long', async () => {
    const tooLongName = "a".repeat(DOCUMENT_NAME_LENGTH_LIMIT + 1)
    // TESTED PROCEDURE
    try {
      await db.query(sql`
        CALL update_document(
          ${user1Document1.id},
          ${user1Id},
          ${tooLongName},
          "This is a new document.",
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
          false
        );
      `)
    } catch (e) {
      // EXPECTED RESULT
      expect(e.code).toBe('ER_DATA_TOO_LONG')
      expect(e.errno).toBe(1406)
      expect(e.sqlState).toBe('22001')
      expect(e.sqlMessage).toBe("Data too long for column 'p_name' at row 1")
      expect(e.message).toBe("Data too long for column 'p_name' at row 1")
    }
    const result = (await db.query(sql`
      SELECT name
        FROM documents
        WHERE id = ${user1Document1.id};
    `))
    expect(result).toEqual([{name: user1Document1.name}])
  })

  test('updates document if the content is not too long', async () => {
    const lessThanTooLongContent = "a".repeat(DOCUMENT_CONTENT_LENGTH_LIMIT)
    // TESTED PROCEDURE/EXPECTED RESULT
    await expect(async () => await expect(db.query(sql`
      CALL update_document(
        ${user1Document1.id},
        ${user1Id},
        "New document",
        ${lessThanTooLongContent},
        ${buildDatetimeStrForTest(user1Document1.created_at)},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
        ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
        false
      );
    `))).not.toThrow()
    await new Promise(resolve => setTimeout(resolve, 100))
    const result = (await db.query(sql`
      SELECT content
        FROM documents
        WHERE id = ${user1Document1.id};
    `))
    expect(result).toEqual([{content: lessThanTooLongContent}])
  })

  test('returns error and does not update document if the content is too long', async () => {
    const tooLongContent = "a".repeat(DOCUMENT_CONTENT_LENGTH_LIMIT + 1)
    // TESTED PROCEDURE
    try {
      await db.query(sql`
        CALL update_document (
          ${user1Document1.id},
          ${user1Id},
          "New document",
          ${tooLongContent},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:00.000Z"))},
          ${buildDatetimeStrForTest(new Date("2000-01-03T01:00:01.000Z"))},
          false
        );
      `)
    } catch (e) {
      // EXPECTED RESULT
      expect(e.code).toBe('ER_DATA_TOO_LONG')
      expect(e.errno).toBe(1406)
      expect(e.sqlState).toBe('22001')
      expect(e.sqlMessage).toBe("Data too long for column 'p_content' at row 1")
      expect(e.message).toBe("Data too long for column 'p_content' at row 1")
    }
    const result = (await db.query(sql`
      SELECT content
        FROM documents
        WHERE id = ${user1Document1.id};
    `))
    expect(result).toEqual([{content: user1Document1.content}])
  })

  test('updates every document if used multiple times in a transaction', async () => {
    const newSaveTime = new Date("2000-01-03T02:00:01.000Z")
    const user1Document1Updated: DocumentFromDB = {
      ...user1Document1,
      name: user1Document1.name + ' UPDATED',
      content: user1Document1.content + ' UPDATED',
      updated_at: new Date("2000-01-03T01:00:00.000Z"),
      saved_on_db_at: newSaveTime
    }
    const user1Document2Updated: DocumentFromDB = {
      ...user1Document2,
      name: user1Document2.name + ' UPDATED',
      content: user1Document2.content + ' UPDATED',
      updated_at: new Date("2000-01-03T02:00:00.000Z"),
      saved_on_db_at: newSaveTime
    }
    // TESTED PROCEDURE
    await db.query(sql`
      START TRANSACTION;
      CALL update_document (
        ${user1Document1Updated.id},
        ${user1Document1Updated.user_id},
        ${user1Document1Updated.name},
        ${user1Document1Updated.content},
        ${buildDatetimeStrForTest(user1Document1Updated.created_at)},
        ${buildDatetimeStrForTest(user1Document1Updated.updated_at)},
        ${buildDatetimeStrForTest(user1Document1Updated.saved_on_db_at)},
        ${user1Document1Updated.is_deleted}
      );
      CALL update_document (
        ${user1Document2Updated.id},
        ${user1Document2Updated.user_id},
        ${user1Document2Updated.name},
        ${user1Document2Updated.content},
        ${buildDatetimeStrForTest(user1Document2Updated.created_at)},
        ${buildDatetimeStrForTest(user1Document2Updated.updated_at)},
        ${buildDatetimeStrForTest(user1Document2Updated.saved_on_db_at)},
        ${user1Document2Updated.is_deleted}
      );
      COMMIT;
    `)
    // EXPECTED RESULT
    const result = await db.query(sql`
      SELECT *
        FROM documents
        WHERE user_id = ${user1Id}
        ORDER BY updated_at DESC, saved_on_db_at DESC, created_at DESC;
    `)
    expect(result).toEqual([
      user1Document2Updated,
      user1Document1Updated
    ])
  })

  test('returns error and does not update any document if it got an error in a transaction', async () => {
    const newSaveTime = new Date("2000-01-03T02:00:01.000Z")
    const user1Document1Updated: DocumentFromDB = {
      ...user1Document1,
      name: user1Document1.name + ' UPDATED',
      content: user1Document1.content + ' UPDATED',
      updated_at: new Date("2000-01-03T01:00:00.000Z"),
      saved_on_db_at: newSaveTime
    }
    const user1Document2Updated: DocumentFromDB = {
      ...user1Document2,
      name: user1Document2.name + ' UPDATED',
      content: user1Document2.content + ' UPDATED',
      updated_at: new Date("2000-01-03T02:00:00.000Z"),
      saved_on_db_at: newSaveTime
    }
    const user1Document3AddedWithNotAvailableId: DocumentFromDB = {
      id: user2Document1.id,
      user_id: user1Id,
      name: "New Document with User 2 document #1 ID",
      content: "This is new document with User 2 document #1 ID",
      created_at: new Date("2000-01-04T00:00:00.000Z"),
      updated_at: new Date("2000-01-04T00:00:00.000Z"),
      saved_on_db_at: new Date("2000-01-04T00:00:01.000Z"),
      is_deleted: 0
    }
    // TESTED PROCEDURE
    try {
      await db.query(sql`
      START TRANSACTION;
      CALL update_document (
        ${user1Document1Updated.id},
        ${user1Document1Updated.user_id},
        ${user1Document1Updated.name},
        ${user1Document1Updated.content},
        ${buildDatetimeStrForTest(user1Document1Updated.created_at)},
        ${buildDatetimeStrForTest(user1Document1Updated.updated_at)},
        ${buildDatetimeStrForTest(user1Document1Updated.saved_on_db_at)},
        ${user1Document1Updated.is_deleted}
      );
      CALL update_document (
        ${user1Document2Updated.id},
        ${user1Document2Updated.user_id},
        ${user1Document2Updated.name},
        ${user1Document2Updated.content},
        ${buildDatetimeStrForTest(user1Document2Updated.created_at)},
        ${buildDatetimeStrForTest(user1Document2Updated.updated_at)},
        ${buildDatetimeStrForTest(user1Document2Updated.saved_on_db_at)},
        ${user1Document2Updated.is_deleted}
      );
      CALL update_document (
        ${user1Document3AddedWithNotAvailableId.id},
        ${user1Document3AddedWithNotAvailableId.user_id},
        ${user1Document3AddedWithNotAvailableId.name},
        ${user1Document3AddedWithNotAvailableId.content},
        ${buildDatetimeStrForTest(user1Document3AddedWithNotAvailableId.created_at)},
        ${buildDatetimeStrForTest(user1Document3AddedWithNotAvailableId.updated_at)},
        ${buildDatetimeStrForTest(user1Document3AddedWithNotAvailableId.saved_on_db_at)},
        ${user1Document3AddedWithNotAvailableId.is_deleted}
      );
      COMMIT;
    `)
    } catch (e) {
      expect(e.code).toBe('ER_SIGNAL_EXCEPTION')
      expect(e.errno).toBe(1644)
      expect(e.sqlState).toBe('45021')
      expect(e.sqlMessage).toBe("Another user's document is using the same id.")
      expect(e.message).toBe("Another user's document is using the same id.")
    }
    // EXPECTED RESULT
    const result = await db.query(sql`
      SELECT *
        FROM documents
        WHERE user_id = ${user1Id}
        ORDER BY updated_at DESC, saved_on_db_at DESC, created_at DESC;
    `)
    expect(result).toEqual([
      user1Document2,
      user1Document1
    ])
  })
})
