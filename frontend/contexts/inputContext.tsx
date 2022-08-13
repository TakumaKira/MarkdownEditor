import Constants from 'expo-constants'
import React from "react"
import { getData } from '../services/asyncStorage'
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { deselectDocument, restore, selectSelectedDocumentHasEdit, updateMainInput, updateTitleInput } from "../store/slices/document"
import { getThemeStateFromAsyncStorage } from '../store/slices/theme'

type InputContextState = {}

const InputContext = React.createContext({} as InputContextState)

/** TODO: No need to be as context anymore. */
export const InputContextProvider = (props: {children: React.ReactNode}): JSX.Element => {
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    (async() => {
      const documentState = await getData('document')
      dispatch(restore(documentState))

      // TODO: Make sure this runs after store initialization(acceptServerResponse) is done.
      tryLoadingInputFromUrlParams()
    })()
    dispatch(getThemeStateFromAsyncStorage())
  }, [])
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

  const hasEdit = useAppSelector(selectSelectedDocumentHasEdit)
  const confirmUnsavedDocument = React.useCallback((event: BeforeUnloadEvent): void => {
    event.preventDefault()
    if (!hasEdit) {
      return
    }
    // This shows confirmation dialog.
    event.returnValue = true
  }, [hasEdit])
  React.useEffect(() => {
    window.addEventListener?.('beforeunload', confirmUnsavedDocument)
    return () => window.removeEventListener?.('beforeunload', confirmUnsavedDocument)
  }, [confirmUnsavedDocument])

  return (
    <InputContext.Provider value={{}}>
      {props.children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => React.useContext(InputContext)
