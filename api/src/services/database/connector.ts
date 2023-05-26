import createConnectionPool, { ConnectionPool } from '@databases/mysql';
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../../getEnvs';
import onExit from '../../onExit';

const connections: ConnectionPool[] = []

export default () => {
  const db = createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:3306/${MYSQL_DATABASE}`)
  connections.push(db)
  return db
}

onExit.add(async () => {
  await Promise.all(connections.map(db => {
    db.dispose()
      .then(() => console.info('Database client disposed.'))
      .catch(ex => {
        console.error('Failed to dispose database client.')
        console.error(ex)
      })
  }))
})
