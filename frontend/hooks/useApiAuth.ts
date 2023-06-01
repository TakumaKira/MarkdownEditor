import { DocumentUpdatedWsMessage } from "@api/document"
import React from "react"
import { io, Socket } from 'socket.io-client'
import { DOCUMENT_UPDATED_WS_EVENT } from "../constants"
import env from '../env'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { askServerUpdate } from '../store/slices/document'

/** Dependent on redux store. */
const useApiAuth = (): void => {
  const storeInitializationIsDone = useAppSelector(state => state.storeInitializationIsDone)
  const documentState = useAppSelector(state => state.document)
  const isLoggedIn = useAppSelector(state => !!state.user.email)
  const userState = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  const [socket, setSocket] = React.useState<Socket | null>(null)

  React.useEffect(() => {
    if (!storeInitializationIsDone) {
      return
    }
    const {wsHandshakeToken} = userState
    if (wsHandshakeToken) {
      if (!socket) {
        getSocket(wsHandshakeToken)
        dispatch(askServerUpdate(documentState))
      } else {
        updateSocketToken(wsHandshakeToken)
      }
    } else {
      disposeSocket()
    }
  }, [storeInitializationIsDone, userState.wsHandshakeToken])

  const getSocket = (wsHandshakeToken: string) => {
    const socket = io(`${env.WS_PROTOCOL}://${env.API_DOMAIN}:${env.WS_PORT}`, {auth: {wsHandshakeToken}})
    setSocket(socket)
  }
  const updateSocketToken = (wsHandshakeToken: string) => {
    if (!socket) {
      console.error(new Error('Missing socket.'))
      return
    }
    if (typeof socket.auth === 'function') {
      console.error(new Error('socket.auth must be a object.'))
      return
    }
    socket.auth.wsHandshakeToken = wsHandshakeToken
  }
  const disposeSocket = () => {
    socket?.off(DOCUMENT_UPDATED_WS_EVENT, documentsUpdated)
    setSocket(null)
  }

  const [shouldCheckUpdate, setShouldCheckUpdate] = React.useState<null | DocumentUpdatedWsMessage>(null)

  const documentsUpdated = React.useCallback((message: DocumentUpdatedWsMessage) => {
    // Wait until finishing asking update to avoid to call api if this very device is causing the ws message.
    if (isLoggedIn) {
      setShouldCheckUpdate(message)
    }
  }, [documentState, isLoggedIn])

  React.useEffect(() => {
    if (shouldCheckUpdate && !documentState.isAskingUpdate && (documentState.lastSyncWithDBAt !== null && documentState.lastSyncWithDBAt !== shouldCheckUpdate.savedOnDBAt)) {
      dispatch(askServerUpdate(documentState))
      setShouldCheckUpdate(null)
    }
  }, [shouldCheckUpdate, documentState.isAskingUpdate, shouldCheckUpdate])

  React.useEffect(() => {
    socket?.on(DOCUMENT_UPDATED_WS_EVENT, documentsUpdated)
    return () => {socket?.off(DOCUMENT_UPDATED_WS_EVENT, documentsUpdated)}
  }, [socket, documentsUpdated])
}
export default useApiAuth
