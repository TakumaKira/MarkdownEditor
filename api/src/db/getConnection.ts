import mysql from 'mysql2/promise'

const getConnection = () => {
  return mysql.createConnection({
    host     : 'db',
    user     : process.env.MYSQL_DATABASE_USERNAME_FOR_APP,
    password : process.env.MYSQL_DATABASE_PASSWORD_FOR_APP,
    database : process.env.MYSQL_DATABASE
  })
}
export default getConnection
