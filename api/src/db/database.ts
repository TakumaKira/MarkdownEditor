import createConnectionPool, {sql, ConnectionPool} from '@databases/mysql';
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../getEnvs';

export {sql, ConnectionPool};

const getConnectionPool = () => createConnectionPool(`mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${DATABASE_HOST}:3306/${MYSQL_DATABASE}`);
export default getConnectionPool;
