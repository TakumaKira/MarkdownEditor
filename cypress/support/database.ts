import createConnectionPool from '@databases/mysql';

export default () => {
  const { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } = process.env
  const dbClient = createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:3306/${MYSQL_DATABASE}`)
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
