import Constants from 'expo-constants'
import React from "react"
import { io, Socket } from 'socket.io-client'
import { ManifestExtra } from '../app.config.manifestExtra'
import { setTokenToRequestHeader } from '../services/api'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { askServerUpdate } from '../store/slices/document'

/** Dependent on redux store. */
const useApiAuth = (): void => {
  const storeInitializationIsDone = useAppSelector(state => state.storeInitializationIsDone)
  const documentState = useAppSelector(state => state.document)
  const isLoggedIn = useAppSelector(state => !!state.user.token)
  const userState = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  const [socket, setSocket] = React.useState<Socket>()

  React.useEffect(() => {
    if (!storeInitializationIsDone) {
      return
    }
    const {token} = userState
    setTokenToRequestHeader(token)
    if (token) {
      getSocket(token)
    }
  }, [storeInitializationIsDone, userState.token])

  const getSocket = (token: string) => {
    const WS_PROTOCOL = (Constants.manifest?.extra as ManifestExtra)?.WS_PROTOCOL
    if (!WS_PROTOCOL) {
      throw new Error('WS_PROTOCOL is not defined.')
    }
    const API_DOMAIN = ((Constants.manifest?.extra as ManifestExtra) as ManifestExtra)?.API_DOMAIN
    if (!API_DOMAIN) {
      throw new Error('API_DOMAIN is not defined.')
    }
    const WS_PORT = Number(((Constants.manifest?.extra as ManifestExtra) as ManifestExtra)?.WS_PORT)
    if (!WS_PORT) {
      throw new Error('WS_PORT is not defined.')
    }

    const socket = io(`${WS_PROTOCOL}://${API_DOMAIN}:${WS_PORT}`, {auth: {token}})
    setSocket(socket)
  }

  const documentsUpdated = React.useCallback((updatedAt: string) => {
    if (isLoggedIn && documentState.latestUpdatedDocumentFromDBAt! < updatedAt) {
      dispatch(askServerUpdate(documentState))
    }
  }, [documentState, isLoggedIn])

  React.useEffect(() => {
    socket?.on('documents_updated', documentsUpdated)
    return () => {socket?.off('documents_updated', documentsUpdated)}
  }, [socket, documentsUpdated])
}
export default useApiAuth
