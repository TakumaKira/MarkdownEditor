import Constants from 'expo-constants'
import 'react-native-get-random-values'
import { io } from 'socket.io-client'
import App from './components/App'
import StorybookUI from './storybook'

const apiPort = Number(Constants.manifest?.extra?.apiPort)
if (!apiPort) {
  throw new Error('API_PORT is not defined.')
}
const wsPort = Number(Constants.manifest?.extra?.wsPort)
if (!wsPort) {
  throw new Error('WS_PORT is not defined.')
}
const socket = io(`ws://localhost:${wsPort}`)
socket.on('hello', arg => {
  console.log(arg)
})
socket.emit('howdy', 'stranger')

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
