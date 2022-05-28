import React from "react"

type PreviewContextValue = {
  input: string
  viewerWidth?: number
  disableImageEscapeOnMobile?: boolean
}

export const PreviewContext = React.createContext({} as PreviewContextValue)
