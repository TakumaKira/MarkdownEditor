import React from 'react'
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectColorScheme } from '../store/slices/theme'
import { dismissAuthModal, resetErrorMessage, submitLogin, submitSignup } from '../store/slices/user'
import colors from '../theme/colors'
import fonts from '../theme/fonts'
import textStyles from '../theme/textStyles'
import themeColors from '../theme/themeColors'
import ButtonWithHoverColorAnimation from './common/ButtonWithHoverColorAnimation'
import LoadingCircles from './common/LoadingCircles'
import Modal from './common/Modal'
import { Text, TextInput } from './common/withCustomFont'

export enum AuthStateTypes {
  SIGNUP = 'signup',
  LOGIN = 'login,'
}

const styles = StyleSheet.create({
  modalContentContainer: {
    width: 343,
    borderRadius: 4,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  inputContainer: {
    marginTop: 24,
  },
  input: {
    marginTop: 18,
  },
  inputLabel: {
    color: colors[600],
  },
  inputField: {
    marginTop: 3,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        caretColor: colors.Orange,
      }
    }),
  },
  inputUnderline: {
    height: 1,
    marginTop: 5,
  },
  button: {
    marginTop: 30,
    height: 40,
    borderRadius: 4,
  },
  buttonContents: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    color: colors[100],
  },
  loaderContainer: {
    height: '100%',
    width: 50,
  },
  serverErrorMessage: {
    textAlign: 'center',
    marginTop: 10,
  },
  inputErrorMessage: {
    marginTop: 5,
  },
  errorMessage: {
    color: colors.Orange,
    fontSize: 13,
    fontFamily: fonts.robotoRegular,
  },
  message: {
    marginTop: 16,
  },
})

const AuthModal = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(state => state.user.authState)
  const colorScheme = useAppSelector(selectColorScheme)

  const label = {
    none: '',
    [AuthStateTypes.SIGNUP]: 'Signup',
    [AuthStateTypes.LOGIN]: 'Login',
  }[authState?.type || 'none']

  const handlePressBackground = () => {
    dispatch(dismissAuthModal())
  }

  const [emailInput, setEmailInput] = React.useState('')
  const [passwordInput, setPasswordInput] = React.useState('')
  const [passwordConfirmInput, setPasswordConfirmInput] = React.useState('')

  React.useEffect(() => {
    if (authState) {
      if (authState.emailValidationErrorMessage) {
        dispatch(resetErrorMessage('email'))
      }
      if (authState.serverErrorMessage) {
        dispatch(resetErrorMessage('server'))
      }
    }
  }, [emailInput])
  React.useEffect(() => {
    if (authState) {
      if (authState.passwordValidationErrorMessage) {
        dispatch(resetErrorMessage('password'))
      }
      if (authState.serverErrorMessage) {
        dispatch(resetErrorMessage('server'))
      }
    }
  }, [passwordInput])
  React.useEffect(() => {
    if (authState && 'passwordConfirmValidationErrorMessage' in authState) {
      if (authState.passwordConfirmValidationErrorMessage) {
        dispatch(resetErrorMessage('passwordConfirm'))
      }
      if (authState.serverErrorMessage) {
        dispatch(resetErrorMessage('server'))
      }
    }
  }, [passwordConfirmInput])

  const [submitEmail, setSubmitEmail] = React.useState<string>()

  const handleSubmit = () => {
    if (authState) {
      if (authState.type === AuthStateTypes.SIGNUP) {
        setSubmitEmail(emailInput)
        dispatch(submitSignup({email: emailInput, password: passwordInput, passwordConfirm: passwordConfirmInput}))
      } else {
        dispatch(submitLogin({email: emailInput, password: passwordInput}))
      }
    }
  }

  const EMAIL_LABEL = 'Email'
  const PASSWORD_LABEL = 'Password'
  const PASSWORD_CONFIRM_LABEL = 'Password (Confirm)'

  const successMessage = React.useMemo<string>(() => {
    if (authState?.type === AuthStateTypes.SIGNUP) {
      return `Confirmation email was sent to ${emailInput}.\nPlease confirm to login.`
    }
    return 'Successfully logged in.'
  }, [authState?.type, emailInput])

  return (
    <Modal onPressBackground={() => dispatch(dismissAuthModal())}>
      <View style={[styles.modalContentContainer, themeColors[colorScheme].modalContentContainerBg]}>
        <Text style={[textStyles.previewH4, themeColors[colorScheme].confirmationTitle]}>{label}</Text>
        {!authState?.isSuccess
          ? <>
            <View style={styles.inputContainer}>
              <Input label={EMAIL_LABEL} input={emailInput} setInput={setEmailInput} errorMessage={authState?.emailValidationErrorMessage} />
              <Input label={PASSWORD_LABEL} input={passwordInput} setInput={setPasswordInput} errorMessage={authState?.passwordValidationErrorMessage} style={styles.input} secureTextEntry />
              {authState?.type === AuthStateTypes.SIGNUP &&
                <Input label={PASSWORD_CONFIRM_LABEL} input={passwordConfirmInput} setInput={setPasswordConfirmInput} errorMessage={authState?.passwordConfirmValidationErrorMessage} style={styles.input} secureTextEntry />
              }
            </View>
            <ButtonWithHoverColorAnimation
              onPress={handleSubmit}
              offBgColorRGB={colors.Orange}
              onBgColorRGB={colors.OrangeHover}
              style={styles.button}
              childrenWrapperStyle={styles.buttonContents}
              disabled={authState?.isLoading}
            >
              {authState?.isLoading
                ? <View style={styles.loaderContainer}>
                  <LoadingCircles circleColorRGB="rgb(255,255,255)" />
                </View>
                : <Text style={[styles.buttonLabel, textStyles.headingM]}>
                  {label}
                </Text>
              }
            </ButtonWithHoverColorAnimation>
            {authState?.serverErrorMessage && <Text style={[styles.serverErrorMessage, styles.errorMessage]}>{authState.serverErrorMessage}</Text>}
          </>
          : <>
            <Text style={[styles.message, textStyles.previewParagraph, themeColors[colorScheme].confirmationMessage]}>{successMessage}</Text>
            <ButtonWithHoverColorAnimation onPress={() => dispatch(dismissAuthModal())} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={styles.button} childrenWrapperStyle={styles.buttonContents}>
              <Text style={[styles.buttonLabel, textStyles.headingM]}>OK</Text>
            </ButtonWithHoverColorAnimation>
          </>
        }
      </View>
    </Modal>
  )
}
export default AuthModal

const Input = (props: {label: string, input: string, setInput: (input: string) => void, errorMessage?: string | null, style?: StyleProp<ViewStyle>, secureTextEntry?: boolean}) => {
  const {label, input, setInput, errorMessage, style, secureTextEntry} = props
  const colorScheme = useAppSelector(selectColorScheme)
  return (
    <View style={style}>
      <Text style={[textStyles.bodyM, styles.inputLabel, themeColors[colorScheme].inputUnderLabel]}>{label}</Text>
      <TextInput
        style={[styles.inputField, textStyles.headingM, themeColors[colorScheme].inputText]}
        value={input}
        onChangeText={setInput}
        selectionColor={colors.Orange}
        secureTextEntry={secureTextEntry}
      />
      <View style={[styles.inputUnderline, themeColors[colorScheme].modalBackgroundColor]} />
      {errorMessage && <Text style={[styles.errorMessage, styles.inputErrorMessage]}>{errorMessage}</Text>}
    </View>
  )
}
