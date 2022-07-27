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
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG5Eb2UiLCJpYXQiOjE2NTgyNDE0MTN9.zVQ2f1UWCS8B0UxDBscc9m81YS1WO1CTrmbt4MsPa0Y'
const socket = io(`ws://localhost:${wsPort}`, {auth: {token: TOKEN}})

socket.on('documents_updated', arg => {
  console.log(arg)
})

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
