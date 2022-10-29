import { Router } from 'express'

const rootRouter = Router()
rootRouter.get('/', async (req, res) => {
  res.status(200).send()
})
export default rootRouter
