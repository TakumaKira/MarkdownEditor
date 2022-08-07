import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import Constants from 'expo-constants'
import React from "react"
import { io, Socket } from 'socket.io-client'
import { askServerUpdate } from '../services/api'
import { useAppSelector } from '../store/hooks'

// TODO: Implement login/logout
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG5Eb2UiLCJpYXQiOjE2NTgyNDE0MTN9.zVQ2f1UWCS8B0UxDBscc9m81YS1WO1CTrmbt4MsPa0Y'
AsyncStorage.setItem('token', TOKEN)

const ORIGIN = Constants.manifest?.extra?.ORIGIN
if (!ORIGIN) {
  throw new Error('ORIGIN is not defined.')
}

const wsPort = Number(Constants.manifest?.extra?.wsPort)
if (!wsPort) {
  throw new Error('WS_PORT is not defined.')
}

type AuthContextState = {
  setToken: (token: string) => void
}
const AuthContext = React.createContext({} as AuthContextState)
export const useAuthContext = () => React.useContext(AuthContext)
export const AuthContextProvider = (props: {children: React.ReactNode}): JSX.Element => {
  const documentState = useAppSelector(state => state.document)

  const [socket, setSocket] = React.useState<Socket>()

  React.useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        setToken(token)
      }
    })()
    return () => {socket?.off('documents_updated')}
  }, [])

  const setToken = (token: string) => {
    axios.defaults.headers.common['x-auth-token'] = token
    subscribeToUpdate(token)
  }

  const subscribeToUpdate = (token: string) => {
    // TODO: Make this wss
    const socket = io(`ws://${ORIGIN}:${wsPort}`, {auth: {token}})
    // TODO: Check what happen if token is invalid.

    socket.on('documents_updated', async (updatedAt: string) => {
      if (documentState.latestUpdatedDocumentFromDBAt! < updatedAt) {
        askServerUpdate(documentState)
      }
    })

    setSocket(socket)
  }

  return (
    // TODO: Provide removeToken
    <AuthContext.Provider value={{setToken}}>
      {props.children}
    </AuthContext.Provider>
  )
}
