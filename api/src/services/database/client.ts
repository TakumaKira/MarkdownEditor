import createConnectionPool from '@databases/mysql';
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PORT, MYSQL_PASSWORD, MYSQL_USER } from '../../getEnvs';

export default () => {
  const dbClient = createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`)
  const closeDBClient = async () => {
    return dbClient.dispose()
      .then(() => console.info('Database client disposed.'))
      .catch(ex => {
        console.error('Failed to dispose database client.')
        console.error(ex)
      })
  }
  return { dbClient, closeDBClient }
}
