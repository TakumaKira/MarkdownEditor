import React from "react"

type InputContextState = {
  mainInput: string
  setMainInput: React.Dispatch<React.SetStateAction<string>>
  titleInput: string
  setTitleInput: React.Dispatch<React.SetStateAction<string>>
}

export const InputContext = React.createContext({} as InputContextState)

export const InputContextProvider = (props: {children: React.ReactNode}): JSX.Element => {
  const [titleInput, setTitleInput] = React.useState('')
  const [mainInput, setMainInput] = React.useState('')

  return (
    <InputContext.Provider value={{titleInput, setTitleInput, mainInput, setMainInput}}>
      {props.children}
    </InputContext.Provider>
  )
}

export const useInputContext = () => React.useContext(InputContext)
