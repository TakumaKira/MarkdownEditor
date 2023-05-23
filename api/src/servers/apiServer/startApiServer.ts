import { Server } from "http"
import getApiApp from "./apiApp"

const startApiServer = async (apiPort: number): Promise<Server> => {
  return (await getApiApp()).listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
}
export default startApiServer
