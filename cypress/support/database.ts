import createConnectionPool, { sql } from '@databases/mysql';

const getConnectionPool = () => createConnectionPool(`mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.DATABASE_HOST}:3306/${process.env.MYSQL_DATABASE}`)
const db = getConnectionPool()

process.once('SIGTERM', () => {
  db.dispose().catch((ex) => {
    console.error(ex)
  })
})

export default db
export { sql }
