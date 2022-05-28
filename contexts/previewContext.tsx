import React from "react"

type PreviewContextValue = {
  viewerWidth?: number
  disableImageEscapeOnMobile?: boolean
}

export const PreviewContext = React.createContext({} as PreviewContextValue)
