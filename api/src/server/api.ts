import express from "express"
import { setupApi } from "../startup"

const startApi = (apiPort: number) => {
  const expressApp = express()
  setupApi(expressApp)

  return expressApp.listen(apiPort, () => {
    console.log('TODO: Switch origin with environment variables.')
    console.log(`⚡️[server]: Server is running at https://localhost:${apiPort}`)
  })
}
export default startApi
