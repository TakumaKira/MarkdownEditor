import Constants from 'expo-constants'
import React from "react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { deselectDocument, getDocumentStateFromAsyncStorage, selectSelectedDocument } from "../store/slices/document"
import { getThemeStateFromAsyncStorage } from '../store/slices/theme'

export type ConfirmationStateProps = {
  state: ConfirmationState.NONE | ConfirmationState.DELETE
} | {
  state: ConfirmationState.LEAVE_UNSAVED_DOCUMENT
  nextId: string
}
export enum ConfirmationState {
  NONE = 'none',
  DELETE = 'delete',
  LEAVE_UNSAVED_DOCUMENT = 'leaveUnsavedDocument',
}
type InputContextState = {
  mainInput: string
  setMainInput: React.Dispatch<React.SetStateAction<string>>
  titleInput: string
  setTitleInput: React.Dispatch<React.SetStateAction<string>>
  confirmationState: ConfirmationStateProps
  setConfirmationState: React.Dispatch<React.SetStateAction<ConfirmationStateProps>>
  hasEdit: boolean
}

export const InputContext = React.createContext({} as InputContextState)

export const InputContextProvider = (props: {children: React.ReactNode}): JSX.Element => {
  const [titleInput, setTitleInput] = React.useState('')
  const [mainInput, setMainInput] = React.useState('')
  const [confirmationState, setConfirmationState] = React.useState<ConfirmationStateProps>({state: ConfirmationState.NONE})

  const dispatch = useAppDispatch()
  React.useEffect(() => {
    (async() => {
      await dispatch(getDocumentStateFromAsyncStorage()).unwrap()
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
    setTitleInput(Constants.manifest?.extra?.NEW_DOCUMENT_TITLE)
    setMainInput(decodeURIComponent(_input))
  }

  const selectedDocument = useAppSelector(selectSelectedDocument)
  React.useEffect(() => {
    if (selectedDocument) {
      setMainInput(selectedDocument.content)
    }
  }, [selectedDocument])

  const hasEdit = React.useMemo(() => {
    return (selectedDocument === null && (titleInput !== '' || mainInput !== ''))
      || (selectedDocument !== null && (titleInput !== selectedDocument.name || mainInput !== selectedDocument.content))
  }, [selectedDocument, titleInput, mainInput])

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
    <InputContext.Provider value={{titleInput, setTitleInput, mainInput, setMainInput, confirmationState, setConfirmationState, hasEdit}}>
      {props.children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => React.useContext(InputContext)
