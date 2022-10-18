import express from "express"
import { setupApi } from "../startup"

const startApi = (origin: string, apiPort: number, appPort: number) => {
  const expressApp = express()
  setupApi(expressApp, origin, appPort)

  return expressApp.listen(apiPort, () => {
    console.log(`⚡️[server]: Server is running at ${origin}:${apiPort}`)
  })
}
export default startApi
