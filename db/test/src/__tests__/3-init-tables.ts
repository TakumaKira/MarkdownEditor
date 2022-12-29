import getConnectionPool, {sql, ConnectionPool} from '../database';

let db: ConnectionPool
beforeAll(() => {
  db = getConnectionPool()
})
afterAll(() => {
  return db.dispose()
})

test('users table has expected columns', async () => {
  expect(
    await db.query(sql`
      SHOW COLUMNS FROM users;
    `)
  ).toEqual([
    {
      "Default": null,
      "Extra": "auto_increment",
      "Field": "id",
      "Key": "PRI",
      "Null": "NO",
      "Type": "int",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "email",
      "Key": "UNI",
      "Null": "NO",
      "Type": "varchar(50)",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "password",
      "Key": "",
      "Null": "NO",
      "Type": "char(60)",
    },
    {
      "Default": "0",
      "Extra": "",
      "Field": "is_activated",
      "Key": "",
      "Null": "NO",
      "Type": "tinyint(1)",
    },
  ]);
})

test('documents table has expected columns', async () => {
  expect(
    await db.query(sql`
      SHOW COLUMNS FROM documents;
    `)
  ).toEqual([
    {
      "Default": null,
      "Extra": "",
      "Field": "id",
      "Key": "PRI",
      "Null": "NO",
      "Type": "char(36)",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "user_id",
      "Key": "MUL",
      "Null": "NO",
      "Type": "int",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "name",
      "Key": "",
      "Null": "YES",
      "Type": "varchar(50)",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "content",
      "Key": "",
      "Null": "YES",
      "Type": "varchar(20000)",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "created_at",
      "Key": "",
      "Null": "YES",
      "Type": "datetime",
    },
    {
      "Default": null,
      "Extra": "",
      "Field": "updated_at",
      "Key": "",
      "Null": "NO",
      "Type": "datetime",
    },
    {
      "Default": "0",
      "Extra": "",
      "Field": "is_deleted",
      "Key": "",
      "Null": "NO",
      "Type": "tinyint(1)",
    },
  ]);
})
