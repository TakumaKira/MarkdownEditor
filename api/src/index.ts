import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'socket.io'
import startup from './startup'

dotenv.config()

const apiPort = Number(process.env.API_PORT)
if (!apiPort) {
  throw new Error('API_PORT is not defined.')
}
const app = express()
startup(app)

const server = app.listen(apiPort, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${apiPort}`);
})
export default server

const wsPort = Number(process.env.WS_PORT)
if (!wsPort) {
  throw new Error('WS_PORT is not defined.')
}

const appPort = Number(process.env.APP_PORT)
if (!appPort) {
  throw new Error('APP_PORT is not defined.')
}

const io = new Server(wsPort, {cors: {origin: `http://localhost:${appPort}`}})
io.on('connection', socket => {
  socket.emit('hello', 'world')

  socket.on('howdy', arg => {
    console.log(arg)
  })
})
