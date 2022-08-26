import Constants from 'expo-constants'
import React from 'react'
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { deselectDocument, updateMainInput, updateTitleInput } from "../store/slices/document"

/** Dependent on redux store. */
const useLoadInputFromUrlParams = () => {
  const dispatch = useAppDispatch()
  const initializationIsDone = useAppSelector(state => state.initializationIsDone)

  const tryLoadingInputFromUrlParams = () => {
    const search = window?.location?.search
    if (!search) {
      return
    }
    const _input = new URLSearchParams(search).get('input')
    if (!_input) {
      return
    }
    dispatch(deselectDocument())
    dispatch(updateTitleInput(Constants.manifest?.extra?.NEW_DOCUMENT_TITLE))
    dispatch(updateMainInput(decodeURIComponent(_input)))
  }
  React.useEffect(() => {
    if (initializationIsDone) {
      tryLoadingInputFromUrlParams()
    }
  }, [initializationIsDone])
}
export default useLoadInputFromUrlParams
