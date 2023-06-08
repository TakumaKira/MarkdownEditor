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

  const [shouldGetSocket, setShouldGetSocket] = React.useState(false)

  const [shouldGetSocketAfterDelay, setShouldGetSocketAfterDelay] = React.useState<number | null>(null)
  const [shouldGetSocketAfterDelayTimeoutId, setShouldGetSocketAfterDelayTimeoutId] = React.useState<NodeJS.Timeout | null>(null)

  const [retryFlag, setRetryFlag] = React.useState(false)

  const [lastWsHandshakeToken, setLastWsHandshakeToken] = React.useState<string | null>(null)

  // Sync document initially.
  React.useEffect(() => {
    if (!storeInitializationIsDone) {
      return
    }
    if (userState.firstSyncIsDone) {
      return
    }
    if (!userState.email) {
      return
    }
    dispatch(askServerUpdate({documentState, isFirstAfterLogin: true}))
  }, [storeInitializationIsDone, userState.email])

  // Manage websocket.
  React.useEffect(() => {
    const {wsHandshakeToken, firstSyncIsDone} = userState
    if (wsHandshakeToken) {
      if (!socket) {
        if (firstSyncIsDone) {
          setShouldGetSocket(true)
        }
      } else {
        updateSocketToken(wsHandshakeToken)
      }
    } else {
      disposeSocket()
    }
  }, [userState.wsHandshakeToken, userState.firstSyncIsDone])

  // Retry establish websocket connection.
  React.useEffect(() => {
    if (!retryFlag) {
      return
    }
    if (!userState.wsHandshakeToken) {
      return
    }
    if (userState.wsHandshakeToken === lastWsHandshakeToken) {
      return
    }
    // Trigger below only when wsHandshakeToken is updated from the last time.
    setShouldGetSocketAfterDelay(1000)
    setRetryFlag(false)
  }, [retryFlag, userState.wsHandshakeToken])

  // Delay to get socket to avoid frequent wsHandshakeToken update right after preceding API request.
  React.useEffect(() => {
    if (!shouldGetSocketAfterDelay) {
      return
    }
    if (shouldGetSocketAfterDelayTimeoutId) {
      clearTimeout(shouldGetSocketAfterDelayTimeoutId)
    }
    setShouldGetSocketAfterDelayTimeoutId(setTimeout(() => {
      setShouldGetSocket(true)
      setShouldGetSocketAfterDelay(null)
      setShouldGetSocketAfterDelayTimeoutId(null)
    }, shouldGetSocketAfterDelay))
  }, [shouldGetSocketAfterDelay])

  // Get socket.
  React.useEffect(() => {
    if (!shouldGetSocket) {
      return
    }

    const socket = io(`${env.WS_PROTOCOL}://${env.API_DOMAIN}:${env.WS_PORT}`, {
      auth: { wsHandshakeToken: userState.wsHandshakeToken },
      withCredentials: true,
      autoConnect: false,
    })
    setLastWsHandshakeToken(userState.wsHandshakeToken)
    /**
     * Socket keeps polling after being disconnected by the server when wsHandshakeToken is updated on the server but not on the client polling request and it results in unhandled 400.
     * To fix this, this should close the socket when being disconnected by the server and create new socket if this has new wsHandshakeToken to try.
     */
    socket.on('connect_error', error => {
      console.error(error);
      disposeSocket()
      setRetryFlag(true)
    })
    socket.on('disconnect', reason => {
      console.log(reason);
      disposeSocket()
      setRetryFlag(true)
    })
    socket.connect()
    setSocket(socket)

    setShouldGetSocket(false)
  }, [shouldGetSocket])

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
    socket?.disconnect()
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
      dispatch(askServerUpdate({documentState}))
      setShouldCheckUpdate(null)
    }
  }, [shouldCheckUpdate, documentState.isAskingUpdate, shouldCheckUpdate])

  React.useEffect(() => {
    socket?.on(DOCUMENT_UPDATED_WS_EVENT, documentsUpdated)
    return () => {socket?.off(DOCUMENT_UPDATED_WS_EVENT, documentsUpdated)}
  }, [socket, documentsUpdated])
}
export default useApiAuth
