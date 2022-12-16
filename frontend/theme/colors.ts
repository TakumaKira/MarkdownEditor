import { ColorValue } from "react-native"

const colors: { [key: number | string]: ColorValue } = {
  1000: 'rgb(21, 22, 25)', // '#151619',
  900: 'rgb(29, 31, 34)', // '#1D1F22',
  800: 'rgb(43, 45, 49)', // '#2B2D31',
  700: 'rgb(53, 57, 63)', // '#35393F',
  600: 'rgb(90, 96, 105)', // '#5A6069',
  500: 'rgb(124, 129, 135)', // '#7C8187',
  400: 'rgb(193, 196, 203)', // '#C1C4CB',
  300: 'rgb(228, 228, 228)', // '#E4E4E4',
  200: 'rgb(245, 245, 245)', // '#F5F5F5',
  100: 'rgb(255, 255, 255)', // '#FFFFFF',
  'Orange': 'rgb(228, 102, 67)', // '#E46643',
  'OrangeHover': 'rgb(243, 151, 101)', // '#F39765',
  'Red': 'rgb(221, 0, 0)', // '#DD0000',
  'RedHover': 'rgb(255, 83, 83)', // '#FF5353',
} as const

export default colors