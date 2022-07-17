import { Express } from 'express'
import routes from './routes'

const startup = (app: Express) => {
  routes(app)
}
export default startup