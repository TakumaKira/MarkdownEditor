import { boolean, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import AuthModal, { AuthStateTypes } from '../../components/AuthModal';
import ButtonWithHoverColorAnimation from '../../components/common/ButtonWithHoverColorAnimation';
import { Text } from '../../components/common/withCustomFont';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { callAuthModal } from '../../store/slices/user';
import colors from '../../theme/colors';
import themeColors from '../../theme/themeColors';
import getMockStore from '../utils/getMockStore';
import MockText from '../utils/MockText';
import utilStyles from '../utils/styles';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

const styles = StyleSheet.create({
  authContainerLoggedOut: {
    width: 218,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  authButtonsGap: {
    width: 18,
  },
  authButton: {
    flexGrow: 1,
    height: 35,
    borderRadius: 4,
  },
  authButtonContents: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonLabel: {
    color: colors[100],
  },
})

const StoryView = (props: {children: React.ReactNode, colorScheme: 'light' | 'dark'}) => {
  const { children, colorScheme } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(state => state.user)

  return (
    <View style={[utilStyles.fullscreen, themeColors[colorScheme].editorBg]}>
      <View style={[styles.authContainerLoggedOut]}>
        <ButtonWithHoverColorAnimation onPress={() => dispatch(callAuthModal({authStateType: AuthStateTypes.SIGNUP}))} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={[styles.authButton]} childrenWrapperStyle={styles.authButtonContents}>
          <Text style={[styles.authButtonLabel]}>Signup</Text>
        </ButtonWithHoverColorAnimation>
        <View style={styles.authButtonsGap} />
        <ButtonWithHoverColorAnimation onPress={() => dispatch(callAuthModal({authStateType: AuthStateTypes.LOGIN}))} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={[styles.authButton]} childrenWrapperStyle={styles.authButtonContents}>
          <Text style={[styles.authButtonLabel]}>Login</Text>
        </ButtonWithHoverColorAnimation>
      </View>
      <MockText colorScheme={colorScheme} />
      {userState.authState && children}
    </View>
  )
}

storiesOf('AuthModal', module)
  .addDecorator(story =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <StoryView colorScheme={colorScheme}>{story()}</StoryView>
        }
      </ThemeWrapper>
    </Provider>
  )
  .add('to Storybook', () =>
    <AuthModal />
  )
