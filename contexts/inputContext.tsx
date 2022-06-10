import Constants from 'expo-constants'
import React from "react"
import { selectLatestDocument, selectSelectedDocument } from "../store/document"
import { useAppDispatch, useAppSelector } from "../store/hooks"

type InputContextState = {
  mainInput: string
  setMainInput: React.Dispatch<React.SetStateAction<string>>
  titleInput: string
  setTitleInput: React.Dispatch<React.SetStateAction<string>>
  showDeleteConfirmation: boolean
  setShowDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}

export const InputContext = React.createContext({} as InputContextState)

export const InputContextProvider = (props: {children: React.ReactNode}): JSX.Element => {
  const [titleInput, setTitleInput] = React.useState('')
  const [mainInput, setMainInput] = React.useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false)

  const loadInputFromUrlParams = (): boolean => {
    const search = window?.location?.search
    if (!search) {
      return false
    }
    const _input = new URLSearchParams(search).get('input')
    if (!_input) {
      return false
    }
    setTitleInput(Constants.manifest?.extra?.NEW_DOCUMENT_TITLE)
    setMainInput(decodeURIComponent(_input))
    return true
  }
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    const loadedFromUrlParams = loadInputFromUrlParams()
    if (loadedFromUrlParams) {
      return
    }
    dispatch(selectLatestDocument())
  }, [])

  const selectedDocument = useAppSelector(selectSelectedDocument)
  React.useEffect(() => {
    if (selectedDocument) {
      setMainInput(selectedDocument.content)
    }
  }, [selectedDocument])

  return (
    <InputContext.Provider value={{titleInput, setTitleInput, mainInput, setMainInput, showDeleteConfirmation, setShowDeleteConfirmation}}>
      {props.children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => React.useContext(InputContext)
