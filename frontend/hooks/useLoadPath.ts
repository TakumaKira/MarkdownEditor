import Constants from 'expo-constants'
import React from 'react'
import { AuthStateTypes } from '../components/AuthModal'
import { API_PATHS } from '../constants'
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { deselectDocument, updateMainInput, updateTitleInput } from "../store/slices/document"
import { callAuthModal } from "../store/slices/user"

/** Dependent on redux store. */
const useLoadPath = () => {
  const dispatch = useAppDispatch()
  const storeInitializationIsDone = useAppSelector(state => state.storeInitializationIsDone)

  const tryLoadingInputFromUrlParams = (input: string) => {
    dispatch(deselectDocument())
    dispatch(updateTitleInput(Constants.manifest?.extra?.NEW_DOCUMENT_TITLE))
    dispatch(updateMainInput(decodeURIComponent(input)))
  }
  React.useEffect(() => {
    if (!storeInitializationIsDone) {
      return
    }
    if (!window) {
      return
    }
    // Execute here only on web.
    const location = window.location
    if (!location.search) {
      return
    }
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    const input = searchParams.get('input')
    switch (location.pathname) {
      case API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.dir:
        token && dispatch(callAuthModal({authStateType: AuthStateTypes.CONFIRM_SIGNUP_EMAIL, token}))
        break
      case API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.dir:
        token && dispatch(callAuthModal({authStateType: AuthStateTypes.CONFIRM_CHANGE_EMAIL, token}))
        break
      case API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.dir:
        token && dispatch(callAuthModal({authStateType: AuthStateTypes.CONFIRM_RESET_PASSWORD, token}))
        break
      default:
        input && tryLoadingInputFromUrlParams(input)
    }
  }, [storeInitializationIsDone])
}
export default useLoadPath
