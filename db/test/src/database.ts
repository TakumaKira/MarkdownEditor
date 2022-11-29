import createConnectionPool, {sql} from '@databases/mysql';

export {sql};

const db = createConnectionPool('mysql://markdown_editor_app:password@localhost:3306/markdown_editor');
export default db;
