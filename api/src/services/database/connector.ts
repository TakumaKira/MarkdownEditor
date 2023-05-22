import createConnectionPool, { ConnectionPool } from '@databases/mysql';
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../../getEnvs';
import onExit from '../../onExit';

const connections: ConnectionPool[] = []

export default () => {
  const db = createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:3306/${MYSQL_DATABASE}`)
  connections.push(db)
  return db
}

onExit.add(() => {
  connections.forEach(db => {
    db.dispose()
      .then(() => {
        console.info('Database client disconnected.')
      })
      .catch((ex) => {
        console.error(ex)
      })
  })
})
