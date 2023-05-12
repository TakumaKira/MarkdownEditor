import createConnectionPool from '@databases/mysql';
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../../getEnvs';
import onExit from '../../onExit';

const getConnectionPool = () => createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:3306/${MYSQL_DATABASE}`)
const db = getConnectionPool()
export default db

onExit.add(() => {
  db.dispose()
    .then(() => {
      console.info('Database client disconnected.')
    })
    .catch((ex) => {
      console.error(ex)
    })
})
