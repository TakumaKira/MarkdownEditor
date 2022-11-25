import mysql from 'mysql2/promise'
import { DATABASE_HOST, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USER } from '../getEnvs'

const getConnection = () => {
  return mysql.createConnection({
    host     : DATABASE_HOST,
    user     : MYSQL_USER,
    password : MYSQL_PASSWORD,
    database : MYSQL_DATABASE
  })
}
export default getConnection
