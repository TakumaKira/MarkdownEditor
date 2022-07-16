import dotenv from 'dotenv'
import express from 'express'
import mysql from 'mysql2'

dotenv.config()

const app = express()
const port = process.env.PORT
const connection = mysql.createConnection({
  host     : 'db',
  user     : 'root',
  password : 'admin',
  database : 'markdown_editor'
})
connection.connect()
connection.query('CALL get_documents(1)', (error, results, fields) => {
  console.log(error, results, fields)
})
connection.end()

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})
