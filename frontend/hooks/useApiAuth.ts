import React from "react"
import { io, Socket } from 'socket.io-client'
import env from '../env'
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
    const socket = io(`${env.WS_PROTOCOL}://${env.API_DOMAIN}:${env.WS_PORT}`, {auth: {token}})
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
