import AppLoading from 'expo-app-loading'
import { loadAsync } from 'expo-font'
import React from 'react'

const customFonts = {
  'Roboto_300Light': require('../../../assets/fonts/Roboto-Light.ttf'),
  'Roboto_400Regular': require('../../../assets/fonts/Roboto-Regular.ttf'),
  'Roboto_500Medium': require('../../../assets/fonts/Roboto-Medium.ttf'),
  'RobotoSlab_300Light': require('../../../assets/fonts/RobotoSlab-Light.ttf'),
  'RobotoSlab_400Regular': require('../../../assets/fonts/RobotoSlab-Regular.ttf'),
  'RobotoSlab_700Bold': require('../../../assets/fonts/RobotoSlab-Bold.ttf'),
  'RobotoMono_400Regular': require('../../../assets/fonts/RobotoMono-Regular.ttf'),
  'Commissioner_700Bold': require('../../../assets/fonts/Commissioner-Bold.ttf'),
}

const withCustomFont = (Component: any) => (props?: any) => { // TODO: Restrict type
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true
    loadAsync(customFonts).then(() => {
      if (isMounted) setFontsLoaded(true)
    })
    return () => {isMounted = false}
  }, [Component, props])

  if (!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <Component {...props} />
  )
}

export default withCustomFont