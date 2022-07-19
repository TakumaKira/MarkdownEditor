import dotenv from 'dotenv'
import express from 'express'
import startup from './startup'

dotenv.config()
const app = express()
const port = process.env.PORT
startup(app)

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
})
export default server
