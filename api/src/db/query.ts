import mysql, { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2'
import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query'

const connection = mysql.createConnection({
  host     : 'db',
  user     : process.env.MYSQL_DATABASE_USERNAME_FOR_APP,
  password : process.env.MYSQL_DATABASE_PASSWORD_FOR_APP,
  database : process.env.MYSQL_DATABASE
})

const query = <T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
  query: [string, (err: Query.QueryError | null, result: T, fields: FieldPacket[]) => any][]
) => {
  connection.connect()
  query.forEach(([query, fn]) => connection.query(query, fn))
  connection.end()
}
export default query
