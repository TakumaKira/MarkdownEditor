import { ErrorRequestHandler } from 'express'

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err)
  res.status(500).send({message: 'Something went wrong.'})
}
export default errorMiddleware
