import { useWindowDimensions as useWindowDimensionsRN } from "react-native"

/**
 * Add a mockabililty on useWindowDimensions.
 */
const useWindowDimensions = (mockWindowDimensions?: {width?: number; height?: number}): {width: number, height: number} => {
  const {width: actualWindowWidth, height: actualWindowHeight} = useWindowDimensionsRN() // DO NOT CALL ANY HOOKS CONDITIONALLY!!
  return {
    width: mockWindowDimensions?.width === undefined ? actualWindowWidth : mockWindowDimensions.width,
    height: mockWindowDimensions?.height === undefined ? actualWindowHeight : mockWindowDimensions.height
  }
}
export default useWindowDimensions