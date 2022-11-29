import db, {sql} from './database';

test('db', async () => {
  expect(
    await db.query(sql`SELECT id, email, password, is_activated FROM users WHERE email=${'Joe@test.com'}`),
  ).toEqual([]);
})
