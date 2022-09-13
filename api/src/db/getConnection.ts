import mysql from 'mysql2/promise'

const getConnection = () => {
  if (!process.env.DATABASE_HOST) {
    console.log(`Please specify DATABASE_HOST`)
  }
  if (!process.env.MYSQL_DATABASE_USERNAME_FOR_APP) {
    console.log(`Please specify MYSQL_DATABASE_USERNAME_FOR_APP`)
  }
  if (!process.env.MYSQL_DATABASE_PASSWORD_FOR_APP) {
    console.log(`Please specify MYSQL_DATABASE_PASSWORD_FOR_APP`)
  }
  if (!process.env.MYSQL_DATABASE) {
    console.log(`Please specify MYSQL_DATABASE`)
  }
  return mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.MYSQL_DATABASE_USERNAME_FOR_APP,
    password : process.env.MYSQL_DATABASE_PASSWORD_FOR_APP,
    database : process.env.MYSQL_DATABASE
  })
}
export default getConnection
