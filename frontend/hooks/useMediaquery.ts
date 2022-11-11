import React from "react"
import env from '../env'
import useWindowDimensions from './useWindowDimensions'

export enum MediaType {
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

const useMediaquery = (mockDimensions?: Parameters<typeof useWindowDimensions>[0]) => {
  const {width: windowWidth} = useWindowDimensions(mockDimensions) // DO NOT CALL ANY HOOKS CONDITIONALLY!!
  const mediaType = React.useMemo(() => {
    const {MOBILE_TABLET, TABLET_DESKTOP} = env.breakpoints
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