import request from 'supertest'
import express, { Router } from "express"
import errorMiddleware from '../../../src/middlewares/error'

describe('errorMiddleware', () => {
  test('returns 500 if throw occurs if previous router throws', async () => {
    const app = express()
    const throwRouter = Router()
    const PATH = '/'
    const ERROR_MESSAGE = 'Test error.'
    throwRouter.post(PATH, async (req, res, next) => {
      try {
        throw new Error(ERROR_MESSAGE)
      } catch (e) {
        next(e)
      }
    })
    app.use(throwRouter)
    app.use(errorMiddleware)
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const res = await request(app)
      .post(PATH)
      .send()
    expect(res.status).toBe(500)
    expect(res.body).toEqual({message: 'Something went wrong.'})
    expect(consoleError).toBeCalledWith(new Error(ERROR_MESSAGE))
  })
})
