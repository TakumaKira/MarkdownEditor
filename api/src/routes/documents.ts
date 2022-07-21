import { Router } from 'express'
import auth from '../middleware/auth'

const router = Router()

router.get('/', auth, async (req: any, res) => {
  console.log(req.user)
  res.send('documents')
})

export default router
