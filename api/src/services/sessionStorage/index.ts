import onExit from '../../onExit'
import Controller from './controller'

let sessionStorage: Controller

export default () => {
  if (!sessionStorage) {
    sessionStorage = new Controller()
    onExit.add(async () => {
      await sessionStorage.destroy()
        .then(() => console.info('Session controller destroyed.'))
        .catch(err => {
          console.error('Failed to destroy session controller.')
          console.error(err)
        })
    })
  }
  return sessionStorage
}
