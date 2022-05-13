export type FontKeys
  = 'robotoLight'
  | 'robotoRegular'
  | 'robotoMedium'
  | 'robotoSlabLight'
  | 'robotoSlabRegular'
  | 'robotoSlabBold'
  | 'robotoMonoRegular'
  | 'commissionerBold'

export type FontValues
  = 'Roboto_300Light'
  | 'Roboto_400Regular'
  | 'Roboto_500Medium'
  | 'RobotoSlab_300Light'
  | 'RobotoSlab_400Regular'
  | 'RobotoSlab_700Bold'
  | 'RobotoMono_400Regular'
  | 'Commissioner_700Bold'

const fonts: {[key in FontKeys]: FontValues} = {
  robotoLight: 'Roboto_300Light',
  robotoRegular: 'Roboto_400Regular',
  robotoMedium: 'Roboto_500Medium',
  robotoSlabLight: 'RobotoSlab_300Light',
  robotoSlabRegular: 'RobotoSlab_400Regular',
  robotoSlabBold: 'RobotoSlab_700Bold',
  robotoMonoRegular: 'RobotoMono_400Regular',
  commissionerBold: 'Commissioner_700Bold',
} as const

export default fonts
