import onExit from '../../onExit'
import Controller from './controller'

let sessionStorage: Controller

export default () => {
  if (!sessionStorage) {
    sessionStorage = new Controller()
    onExit.add(() => sessionStorage.destroy())
  }
  return sessionStorage
}
