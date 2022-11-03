import express from "express"
import { setupApi } from "../startup"

const startApi = (apiPort: number, frontendDomain: string) => {
  const expressApp = express()
  setupApi(expressApp, frontendDomain)

  return expressApp.listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
}
export default startApi
