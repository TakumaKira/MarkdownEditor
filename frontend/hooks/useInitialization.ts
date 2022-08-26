import React from "react"
import { getData } from '../services/asyncStorage'
import { useAppDispatch } from "../store/hooks"
import { restoreDocument } from "../store/slices/document"
import { storeInitializationDone } from "../store/slices/initializationIsDone"
import { restoreTheme } from "../store/slices/theme"
import { login, restoreUser } from "../store/slices/user"

/** Dependent on redux store. */
const useInitialization = (): void => {
  const dispatch = useAppDispatch()

  // TODO: Remove the token below after login implemented.
  const mockLogin = () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG5Eb2VAbWFya2Rvd24uY29tIiwiaWF0IjoxNjYwOTE4OTIxfQ.KmSA0QLVIGxvWgqVSb67txi2hdXmFwf-xXrxpaoIbPg'
    dispatch(login(mockToken))
    console.log('mockLogin')
  }
  React.useEffect(() => {setTimeout(mockLogin, 5000)}, [])

  React.useEffect(() => {
    Promise.all([
      _restoreUser().catch(console.error),
      _restoreDocument().catch(console.error),
      _restoreTheme().catch(console.error)
    ])
    .then(() => dispatch(storeInitializationDone()))
  }, [])

  const _restoreUser = async () => {
    const userState = await getData('user')
    dispatch(restoreUser(userState))
  }
  const _restoreDocument = async () => {
    const documentState = await getData('document')
    dispatch(restoreDocument(documentState))
  }
  const _restoreTheme = async () => {
    const themeState = await getData('theme')
    dispatch(restoreTheme(themeState))
  }
}
export default useInitialization
