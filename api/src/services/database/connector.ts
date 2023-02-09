import createConnectionPool from '@databases/mysql';
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../../getEnvs';

const getConnectionPool = () => createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:3306/${MYSQL_DATABASE}`)
const db = getConnectionPool()
export default db

process.once('SIGTERM', () => {
  db.dispose().catch((ex) => {
    console.error(ex)
  })
})
