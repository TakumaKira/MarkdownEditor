import React from "react"

type PreviewContextValue = {
  viewerWidth: number
}

export const PreviewContext = React.createContext({} as PreviewContextValue)
