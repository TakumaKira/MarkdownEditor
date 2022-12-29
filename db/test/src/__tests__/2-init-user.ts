import getConnectionPool, {sql, ConnectionPool} from '../database';

let db: ConnectionPool
beforeAll(() => {
  db = getConnectionPool()
})
afterAll(() => {
  return db.dispose()
})

test('markdown_editor_app has minimum required grants', async () => {
  await expect(
    db.query(sql`
      SHOW GRANTS FOR 'markdown_editor_app';
    `)
  ).resolves.toEqual([
    {
      "Grants for markdown_editor_app@%": "GRANT USAGE ON *.* TO `markdown_editor_app`@`%`",
    },
    {
      "Grants for markdown_editor_app@%": "GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON `markdown_editor`.* TO `markdown_editor_app`@`%`",
    },
  ]);
})
