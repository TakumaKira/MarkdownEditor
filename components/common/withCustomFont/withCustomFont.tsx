import AppLoading from 'expo-app-loading'
import { FontSource, loadAsync } from 'expo-font'
import React from 'react'
import { Text, TextInput, TextInputProps, TextProps } from 'react-native'
import fonts, { FontValues } from '../../../theme/fonts'

const customFonts = {
  [fonts.robotoLight]: require('../../../assets/fonts/Roboto-Light.ttf'),
  [fonts.robotoRegular]: require('../../../assets/fonts/Roboto-Regular.ttf'),
  [fonts.robotoMedium]: require('../../../assets/fonts/Roboto-Medium.ttf'),
  [fonts.robotoSlabLight]: require('../../../assets/fonts/RobotoSlab-Light.ttf'),
  [fonts.robotoSlabRegular]: require('../../../assets/fonts/RobotoSlab-Regular.ttf'),
  [fonts.robotoSlabBold]: require('../../../assets/fonts/RobotoSlab-Bold.ttf'),
  [fonts.robotoMonoRegular]: require('../../../assets/fonts/RobotoMono-Regular.ttf'),
  [fonts.commissionerBold]: require('../../../assets/fonts/Commissioner-Bold.ttf'),
} as Record<FontValues, FontSource>

const withCustomFont = (Component: React.ComponentFactory<TextProps, Text> | React.ComponentFactory<TextInputProps, TextInput>) => (props?: TextProps | TextInputProps) => { // TODO: Better type annotation
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    loadAsync(customFonts).then(() => {
      if (isMounted) setFontsLoaded(true)
    })
    return () => {isMounted = false}
  }, [])

  if (!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <Component {...props} />
  )
}

export default withCustomFont