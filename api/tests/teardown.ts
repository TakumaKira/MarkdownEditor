export default async function() {
  await new Promise<void>(resolve => {
    wsServer
      ? wsServer.close(() => {
        resolve()
      })
      : resolve()
  })
  if (db) {
    await db.dispose()
  }
  if (redisClient?.isOpen) {
    await redisClient.quit()
  }
  return
}
