import { ColorValue } from "react-native"

const colors: { [key: number | string]: ColorValue } = {
  1000: '#151619',
  900: '#1D1F22',
  800: '#2B2D31',
  700: '#35393F',
  600: '#5A6069',
  500: '#7C8187',
  400: '#C1C4CB',
  300: '#E4E4E4',
  200: '#F5F5F5',
  100: '#FFFFFF',
  'Orange': '#E46643',
  'OrangeHover': '#F39765',
} as const

export default colors