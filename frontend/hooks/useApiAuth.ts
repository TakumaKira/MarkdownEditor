import axios from 'axios'
import Constants from 'expo-constants'
import React from "react"
import { io, Socket } from 'socket.io-client'
import { askServerUpdate } from '../services/api'
import { useAppDispatch, useAppSelector } from '../store/hooks'

/** Dependent on redux store. */
const useApiAuth = (): void => {
  const documentState = useAppSelector(state => state.document)
  const isLoggedIn = useAppSelector(state => !!state.user.token)
  const userState = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  const [socket, setSocket] = React.useState<Socket>()

  React.useEffect(() => {
    const {token} = userState
    setTokenToRequestHeader(token)
    if (token) {
      getSocket(token)
    }
  }, [userState.token])

  const setTokenToRequestHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token
    } else {
      delete axios.defaults.headers.common['x-auth-token']
    }
  }

  const getSocket = (token: string) => {
    const ORIGIN = Constants.manifest?.extra?.ORIGIN
    if (!ORIGIN) {
      throw new Error('ORIGIN is not defined.')
    }
    const WS_PORT = Number(Constants.manifest?.extra?.WS_PORT)
    if (!WS_PORT) {
      throw new Error('WS_PORT is not defined.')
    }

    // TODO: Make this wss
    const socket = io(`ws://${ORIGIN}:${WS_PORT}`, {auth: {token}})
    setSocket(socket)
  }

  const documentsUpdated = React.useCallback((updatedAt: string) => {
    if (isLoggedIn && documentState.latestUpdatedDocumentFromDBAt! < updatedAt) {
      askServerUpdate(documentState, dispatch)
    }
  }, [documentState, isLoggedIn])

  React.useEffect(() => {
    socket?.on('documents_updated', documentsUpdated)
    return () => {socket?.off('documents_updated', documentsUpdated)}
  }, [socket, documentsUpdated])
}
export default useApiAuth
