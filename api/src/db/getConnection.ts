// TODO: Delete this after removing reference to this file and uninstall mysql2.

import mysql from 'mysql2/promise'
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../getEnvs'

const getConnection = () => {
  return mysql.createConnection({
    host     : DATABASE_HOST,
    database : MYSQL_DATABASE,
    user     : MYSQL_USER,
    password : MYSQL_PASSWORD,
  })
}
export default getConnection
