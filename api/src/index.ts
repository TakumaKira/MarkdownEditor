import dotenv from 'dotenv'
import express from 'express'
import startup from './startup'
import query from './db/query'

dotenv.config()
const app = express()
const port = process.env.PORT
startup(app)

query([
  ['CALL get_documents(1)', (error, results, fields) => {
    if (error) {
      console.log(error)
    } else {
      console.log(results)
    }
  }],
])

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})
export default server
