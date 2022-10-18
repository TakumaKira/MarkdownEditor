import mysql from 'mysql2/promise'
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_DATABASE_PASSWORD_FOR_APP, MYSQL_DATABASE_USERNAME_FOR_APP } from '../getEnvs'

const getConnection = () => {
  return mysql.createConnection({
    host     : DATABASE_HOST,
    user     : MYSQL_DATABASE_USERNAME_FOR_APP,
    password : MYSQL_DATABASE_PASSWORD_FOR_APP,
    database : MYSQL_DATABASE
  })
}
export default getConnection
