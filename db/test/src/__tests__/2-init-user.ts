import getConnectionPool, {sql, ConnectionPool} from '../database';

let db: ConnectionPool
beforeAll(() => {
  db = getConnectionPool()
})
afterAll(() => {
  return db.dispose()
})

test('markdown_api has minimum required grants', async () => {
  await expect(
    db.query(sql`
      SHOW GRANTS FOR 'markdown_api';
    `)
  ).resolves.toEqual([
    {
      "Grants for markdown_api@%": "GRANT USAGE ON *.* TO `markdown_api`@`%`",
    },
    {
      "Grants for markdown_api@%": "GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON `markdown_db`.* TO `markdown_api`@`%`",
    },
  ]);
})
