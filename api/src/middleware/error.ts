import { ErrorRequestHandler } from 'express'

const error: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).send('Something went wrong.');
}
export default error