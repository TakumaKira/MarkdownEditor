import Constants from 'expo-constants'
import React from "react"
import { ManifestExtra } from '../app.config.manifestExtra'
import useWindowDimensions from './useWindowDimensions'

export enum MediaType {
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

const useMediaquery = (mockDimensions?: Parameters<typeof useWindowDimensions>[0]) => {
  const {width: windowWidth} = useWindowDimensions(mockDimensions) // DO NOT CALL ANY HOOKS CONDITIONALLY!!
  const mediaType = React.useMemo(() => {
    const {MOBILE_TABLET, TABLET_DESKTOP} = (Constants.manifest?.extra as ManifestExtra)?.breakpoints
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