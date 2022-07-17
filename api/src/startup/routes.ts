import express, { Express } from 'express'
import error from '../middleware/error'
import auth from '../routes/auth'
import documents from '../routes/documents'
import users from '../routes/users'

const routes = (app: Express) => {
  app.use(express.json())
  app.use('/api/auth', auth)
  app.use('/api/users', users)
  app.use('/api/documents', documents)
  app.use(error)
}
export default routes