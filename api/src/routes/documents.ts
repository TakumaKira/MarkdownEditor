import { Router } from 'express'
import { wsServer } from '..'
import { authApi } from '../middleware/auth'

const documentsRouter = Router()

documentsRouter.get('/', authApi, async (req, res) => {
  console.log(req.user)
  res.send('documents')
})

documentsRouter.post('/', authApi, async (req, res) => {
  wsServer.to(req.user.id).emit('documents_updated', 'now')
  res.send('ok')
})

export default documentsRouter
