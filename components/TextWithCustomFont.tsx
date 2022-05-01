import { Roboto_300Light, Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto'
import { RobotoMono_400Regular } from '@expo-google-fonts/roboto-mono'
import { RobotoSlab_300Light, RobotoSlab_400Regular, RobotoSlab_700Bold } from '@expo-google-fonts/roboto-slab'
import { Commissioner_700Bold } from '@expo-google-fonts/commissioner'
import AppLoading from 'expo-app-loading'
import { useFonts } from 'expo-font'
import React from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'

const TextWithCustomFont = (props: {children: string, style?: StyleProp<TextStyle>}) => {
  const [fontsLoaded] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    RobotoSlab_300Light,
    RobotoSlab_400Regular,
    RobotoSlab_700Bold,
    RobotoMono_400Regular,
    Commissioner_700Bold,
  })

  if (!fontsLoaded) {
    return <AppLoading />
  }

  const {
    children,
    style,
  } = props

  return (
    <Text style={style}>{children}</Text>
  )
}

export default TextWithCustomFont