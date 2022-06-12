import Constants from 'expo-constants'
import React from "react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { deselectDocument, getDataFromAsyncStorage, selectLatestDocument, selectSelectedDocument } from "../store/slices/document"

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
}

export const InputContext = React.createContext({} as InputContextState)

export const InputContextProvider = (props: {children: React.ReactNode}): JSX.Element => {
  const [titleInput, setTitleInput] = React.useState('')
  const [mainInput, setMainInput] = React.useState('')
  const [confirmationState, setConfirmationState] = React.useState<ConfirmationStateProps>({state: ConfirmationState.NONE})

  const dispatch = useAppDispatch()
  React.useEffect(() => {
    (async() => {
      await dispatch(getDataFromAsyncStorage()).unwrap()
      tryLoadingInputFromUrlParams()
    })()
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

  return (
    <InputContext.Provider value={{titleInput, setTitleInput, mainInput, setMainInput, confirmationState, setConfirmationState}}>
      {props.children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => React.useContext(InputContext)
