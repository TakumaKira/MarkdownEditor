const callbackList: Array<Function> = []

const onExit = {
  add: function (callback: Function) {
    callbackList.push(callback)
  }
}
export default onExit

function handle(signal: string) {
  console.log(`\nReceived ${signal}`)
  for (const callback of callbackList) {
    callback()
  }
  process.exit()
}
process.on('SIGINT', handle)
process.on('SIGTERM', handle)
