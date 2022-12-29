import createConnectionPool, {sql, ConnectionPool} from '@databases/mysql';

export {sql, ConnectionPool};

const getConnectionPool = () => createConnectionPool('mysql://markdown_editor_app:password@localhost:3306/markdown_editor');
export default getConnectionPool;
