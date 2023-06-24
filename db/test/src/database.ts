import createConnectionPool, {sql, ConnectionPool} from '@databases/mysql';

export {sql, ConnectionPool};

const getConnectionPool = () => createConnectionPool('mysql://markdown_api:password@localhost:3306/markdown_db');
export default getConnectionPool;
