import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import Constants from 'expo-constants'
import React from "react"
import { io, Socket } from 'socket.io-client'
import { askServerUpdate } from '../services/api'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { acceptServerResponse } from '../store/slices/document'

// TODO: Implement login/logout
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG5Eb2VAbWFya2Rvd24uY29tIiwiaWF0IjoxNjYwOTE4OTIxfQ.KmSA0QLVIGxvWgqVSb67txi2hdXmFwf-xXrxpaoIbPg'
const LOGIN_TOKEN_KEY = Constants.manifest?.extra?.LOGIN_TOKEN_KEY
if (!LOGIN_TOKEN_KEY) {
  throw new Error('LOGIN_TOKEN_KEY is not defined.')
}

AsyncStorage.setItem(LOGIN_TOKEN_KEY, TOKEN)

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
  const dispatch = useAppDispatch()

  const [socket, setSocket] = React.useState<Socket>()

  React.useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(LOGIN_TOKEN_KEY)
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
    setSocket(socket)
  }

  const documentsUpdated = React.useCallback((updatedAt: string) => {
    if (documentState.latestUpdatedDocumentFromDBAt! < updatedAt) {
      askServerUpdate(documentState)
        .then(response => {
          dispatch(acceptServerResponse(response))
        })
    }
  }, [documentState])

  React.useEffect(() => {
    socket?.on('documents_updated', documentsUpdated)
    return () => {socket?.off('documents_updated', documentsUpdated)}
  }, [socket, documentsUpdated])

  return (
    // TODO: Provide removeToken
    <AuthContext.Provider value={{setToken}}>
      {props.children}
    </AuthContext.Provider>
  )
}
