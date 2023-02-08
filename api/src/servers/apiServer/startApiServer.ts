import apiServer from "./apiServer"

const startApiServer = (apiPort: number) => {
  return apiServer.listen(apiPort, () => {
    console.log(`⚡️[server]: API server is running at localhost:${apiPort}`)
  })
}
export default startApiServer
