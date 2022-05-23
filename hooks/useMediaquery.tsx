import Constants from 'expo-constants'
import React from "react"
import { useWindowDimensions } from "react-native"

export enum MediaType {
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

const useMediaquery = () => {
  const windowWidth = useWindowDimensions().width
  const mediaType = React.useMemo(() => {
    const {MOBILE_TABLET, TABLET_DESKTOP} = Constants.manifest?.extra?.breakpoints
    if (windowWidth < MOBILE_TABLET) {
      return MediaType.MOBILE
    }
    if (windowWidth < TABLET_DESKTOP) {
      return MediaType.TABLET
    }
    return MediaType.DESKTOP
  }, [windowWidth])
  return mediaType
}

export default useMediaquery