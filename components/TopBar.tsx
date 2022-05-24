import React, { Dispatch, SetStateAction } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CloseIcon from '../assets/icon-close.svg'
import HamburgerIcon from '../assets/icon-menu.svg'
import useMediaquery, { MediaType } from '../hooks/useMediaquery'
import colors from '../theme/colors'
import SvgWrapper from './common/SvgWrapper'
import Title from './Title'

export const TOP_BAR_HEIGHT = 72

const styles = StyleSheet.create({
  container: {
    height: TOP_BAR_HEIGHT,
    backgroundColor: colors[800],
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburgerButton: {
    alignSelf: 'stretch',
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors[700],
  },
  title: {
    marginLeft: 24,
    marginRight: 29,
  },
  border: {
    height: 40,
    width: 1,
    backgroundColor: colors[600],
  },
})

const TopBar = (props: {setShowSidebar: Dispatch<SetStateAction<boolean>>, showSidebar: boolean}) => {
  const {
    setShowSidebar,
    showSidebar,
  } = props

  const mediaType = useMediaquery()

  return (
    <View style={styles.container}>
      <HamburgerButton toggle={() => setShowSidebar(value => !value)} isOpen={showSidebar} />
      {mediaType === MediaType.DESKTOP &&
        <>
          <Title style={styles.title} />
          <View style={styles.border} />
        </>
      }
    </View>
  )
}

const HamburgerButton = (props: {toggle: () => void, isOpen: boolean}) => {
  const {
    toggle,
    isOpen,
  } = props

  return (
    <TouchableOpacity onPress={toggle} style={styles.hamburgerButton}>
      <SvgWrapper>
        {isOpen ? <CloseIcon /> : <HamburgerIcon />}
      </SvgWrapper>
    </TouchableOpacity>
  )
}

export default TopBar
