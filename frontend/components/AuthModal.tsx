import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import React from 'react'
import { ColorValue, Platform, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import { RootState } from '../store'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { NEEDS_AT_LEAST_EMAIL_OR_PASSWORD } from '../store/middlewares/auth'
import { selectColorScheme } from '../store/slices/theme'
import { askServerDeleteAccount, AuthStateTypes, callAuthModal, dismissAuthModal, resetErrorMessage, submitConfirmNewEmail, submitEdit, submitLogin, submitNewPassword, submitResetPassword, submitSignup } from '../store/slices/user'
import colors from '../theme/colors'
import fonts from '../theme/fonts'
import textStyles from '../theme/textStyles'
import themeColors from '../theme/themeColors'
import ButtonWithHoverColorAnimation from './common/ButtonWithHoverColorAnimation'
import LoadingCircles from './common/LoadingCircles'
import Modal from './common/Modal'
import { Text, TextInput } from './common/withCustomFont'

const styles = StyleSheet.create({
  modalContentContainer: {
    width: 343,
    borderRadius: 4,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  contentsContainer: {
    marginTop: 24,
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
  link: {
    fontFamily: fonts.robotoRegular,
    fontSize: 13,
    textAlign: 'center',
  },
  marginTop: {
    marginTop: 18,
  },
})

enum ContentTypes {
  EMAIL_INPUT = 'emailInput',
  PASSWORD_INPUT = 'passwordInput',
  PASSWORD_CONFIRM_INPUT = 'passwordConfirmInput',
  TEXT = 'text',
  LINK = 'link',
  BUTTON = 'button',
}
type SubmitButtonVariants = 'primary' | 'danger'
const authModalSettings: {[type in AuthStateTypes]: {
  title: string
  contents: (
    {type: ContentTypes.EMAIL_INPUT | ContentTypes.PASSWORD_INPUT | ContentTypes.PASSWORD_CONFIRM_INPUT}
    | {type: ContentTypes.TEXT, text: string}
    | {type: ContentTypes.BUTTON, label: string, variant: SubmitButtonVariants, createAction?: <Payload extends Record<string, string>>(payload: Payload) => Parameters<ThunkDispatch<RootState, any, AnyAction>>[0]}
    | {type: ContentTypes.LINK, label: string, createAction: <Payload extends Record<string, string>>(payload?: Payload) => AnyAction}
  )[]
  getDoneText: (option?: string) => {text: string, isError?: boolean}
}} = {
  [AuthStateTypes.SIGNUP]: {
    title: 'Signup',
    contents: [
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.PASSWORD_CONFIRM_INPUT},
      {type: ContentTypes.BUTTON, label: 'Signup', variant: 'primary', createAction: ({emailInput, passwordInput, passwordConfirmInput}) => submitSignup({email: emailInput, password: passwordInput, passwordConfirm: passwordConfirmInput})},
    ],
    getDoneText: email => ({text: `Confirmation email was sent to ${email}.\nPlease confirm to login.`}),
  },
  [AuthStateTypes.CONFIRM_SIGNUP_EMAIL]: {
    title: 'Confirm your email',
    contents: [
      {type: ContentTypes.TEXT, text: 'Confirming your email...'},
      {type: ContentTypes.BUTTON, label: '', variant: 'primary'},
    ],
    getDoneText: errorMessage => (errorMessage ? {text: errorMessage, isError: true} : {text: 'Your email is confirmed successfully.'}),
  },
  [AuthStateTypes.LOGIN]: {
    title: 'Login',
    contents: [
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.BUTTON, label: 'Login', variant: 'primary', createAction: ({emailInput, passwordInput}) => submitLogin({email: emailInput, password: passwordInput})},
      {type: ContentTypes.LINK, label: 'Forgot password?', createAction: () => callAuthModal({authStateType: AuthStateTypes.RESET_PASSWORD})},
    ],
    getDoneText: () => ({text: 'Successfully logged in.'}),
  },
  [AuthStateTypes.EDIT]: {
    title: 'Edit email/password',
    contents: [
      {type: ContentTypes.TEXT, text: "You can leave forms where you don't want to change."},
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.PASSWORD_CONFIRM_INPUT},
      {type: ContentTypes.BUTTON, label: 'Save edit', variant: 'primary', createAction: ({emailInput, passwordInput, passwordConfirmInput}) => submitEdit({email: emailInput, password: passwordInput, passwordConfirm: passwordConfirmInput})},
    ],
    getDoneText: successMessage => ({text: successMessage!}),
  },
  [AuthStateTypes.CONFIRM_CHANGE_EMAIL]: {
    title: 'Confirm new email',
    contents: [
      {type: ContentTypes.TEXT, text: 'Please enter your password to confirm new email.'},
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.BUTTON, label: 'Confirm', variant: 'primary', createAction: ({passwordInput}) => submitConfirmNewEmail({password: passwordInput})},
    ],
    getDoneText: errorMessage => (errorMessage ? {text: errorMessage, isError: true} : {text: 'Successfully confirmed.'}),
  },
  [AuthStateTypes.RESET_PASSWORD]: {
    title: 'Reset password',
    contents: [
      {type: ContentTypes.TEXT, text: 'Please enter email you registered.'},
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.BUTTON, label: 'Reset password', variant: 'primary', createAction: ({emailInput}) => submitResetPassword({email: emailInput})},
    ],
    getDoneText: email => ({text: `Confirmation email was sent to ${email}.\nPlease confirm to update email.`}),
  },
  [AuthStateTypes.CONFIRM_RESET_PASSWORD]: {
    title: 'Set new password',
    contents: [
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.PASSWORD_CONFIRM_INPUT},
      {type: ContentTypes.BUTTON, label: 'Save new password', variant: 'primary', createAction: ({passwordInput, passwordConfirmInput}) => submitNewPassword({password: passwordInput, passwordConfirm: passwordConfirmInput})},
    ],
    getDoneText: () => ({text: 'Successfully set new password.'}),
  },
  [AuthStateTypes.DELETE]: {
    title: 'Delete account',
    contents: [
      {type: ContentTypes.TEXT, text: 'Are you really sure you want to delete this account?'},
      {type: ContentTypes.BUTTON, label: 'Cancel', variant: 'primary', createAction: () => dismissAuthModal()},
      {type: ContentTypes.BUTTON, label: 'Delete', variant: 'danger', createAction: () => askServerDeleteAccount()},
    ],
    getDoneText: () => ({text: 'Successfully delete account.'}),
  },
}

const AuthModal = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(state => state.user.authState)
  const colorScheme = useAppSelector(selectColorScheme)

  const handlePressBackground = () => {
    if (authState?.isLoading) {
      return
    }
    dispatch(dismissAuthModal())
  }

  const [emailInput, setEmailInput] = React.useState('')
  const [passwordInput, setPasswordInput] = React.useState('')
  const [passwordConfirmInput, setPasswordConfirmInput] = React.useState('')

  React.useEffect(() => {
    if (authState) {
      if ('emailValidationErrorMessage' in authState && authState.emailValidationErrorMessage) {
        dispatch(resetErrorMessage('email'))
      }
      if (authState.serverErrorMessage) {
        dispatch(resetErrorMessage('server'))
      }
    }
  }, [emailInput])
  React.useEffect(() => {
    if (authState) {
      if ('passwordValidationErrorMessage' in authState && authState.passwordValidationErrorMessage) {
        dispatch(resetErrorMessage('password'))
      }
      if (authState.serverErrorMessage) {
        dispatch(resetErrorMessage('server'))
      }
    }
  }, [passwordInput])
  React.useEffect(() => {
    if (authState) {
      if ('passwordConfirmValidationErrorMessage' in authState && authState.passwordConfirmValidationErrorMessage) {
        dispatch(resetErrorMessage('passwordConfirm'))
      }
      if (authState.serverErrorMessage) {
        dispatch(resetErrorMessage('server'))
      }
    }
  }, [passwordConfirmInput])
  React.useEffect(() => {
    if (authState) {
      if ('emailValidationErrorMessage' in authState && authState.emailValidationErrorMessage === NEEDS_AT_LEAST_EMAIL_OR_PASSWORD) {
        dispatch(resetErrorMessage('email'))
      }
      if ('passwordValidationErrorMessage' in authState && authState.passwordValidationErrorMessage === NEEDS_AT_LEAST_EMAIL_OR_PASSWORD) {
        dispatch(resetErrorMessage('password'))
      }
      if ('passwordConfirmValidationErrorMessage' in authState && authState.passwordConfirmValidationErrorMessage === NEEDS_AT_LEAST_EMAIL_OR_PASSWORD) {
        dispatch(resetErrorMessage('passwordConfirm'))
      }
    }
  }, [emailInput, passwordInput, passwordConfirmInput])

  const settings = authModalSettings[authState!.type]

  const doneText = React.useMemo<{text: string, isError?: boolean}>(() => {
    switch (authState?.type) {
      case AuthStateTypes.SIGNUP:
        return settings.getDoneText(emailInput)
      case AuthStateTypes.CONFIRM_SIGNUP_EMAIL:
        return settings.getDoneText(authState.serverErrorMessage ?? undefined)
      case AuthStateTypes.EDIT:
        const message = emailInput ? `Confirmation email sent to ${emailInput}. Please confirm.` : 'Password successfully changed.'
        return settings.getDoneText(message)
      case AuthStateTypes.CONFIRM_CHANGE_EMAIL:
        return settings.getDoneText(authState.serverErrorMessage ?? undefined)
      case AuthStateTypes.RESET_PASSWORD:
        return settings.getDoneText(emailInput)
    }
    return settings.getDoneText()
  }, [authState, emailInput])

  const submitButtonOffBgColor: {[key in SubmitButtonVariants]: ColorValue} = {
    primary: colors.Orange,
    danger: colors.Red,
  }
  const submitButtonOnBgColor: {[key in SubmitButtonVariants]: ColorValue} = {
    primary: colors.OrangeHover,
    danger: colors.RedHover,
  }

  return (authState &&
    <Modal onPressBackground={handlePressBackground}>
      <View style={[styles.modalContentContainer, themeColors[colorScheme].modalContentContainerBg]}>
        <Text style={[textStyles.previewH4, themeColors[colorScheme].confirmationTitle]}>{settings.title}</Text>
        {!authState.isDone
          ? <>
            <View style={styles.contentsContainer}>
              {settings.contents.map((content, i) => {
                switch (content.type) {
                  case ContentTypes.EMAIL_INPUT:
                    return 'emailValidationErrorMessage' in authState &&
                      <Input
                        key={i}
                        label='Email'
                        input={emailInput}
                        setInput={setEmailInput}
                        errorMessage={authState.emailValidationErrorMessage}
                        style={[i > 0 ? styles.marginTop : undefined]}
                      />
                  case ContentTypes.PASSWORD_INPUT:
                    return 'passwordValidationErrorMessage' in authState &&
                      <Input
                        key={i}
                        label='Password'
                        input={passwordInput}
                        setInput={setPasswordInput}
                        errorMessage={authState.passwordValidationErrorMessage}
                        style={[i > 0 ? styles.marginTop : undefined]}
                        secureTextEntry
                      />
                  case ContentTypes.PASSWORD_CONFIRM_INPUT:
                    return 'passwordConfirmValidationErrorMessage' in authState &&
                      <Input
                        key={i}
                        label='Password (Confirm)'
                        input={passwordConfirmInput}
                        setInput={setPasswordConfirmInput}
                        errorMessage={authState.passwordConfirmValidationErrorMessage}
                        style={[i > 0 ? styles.marginTop : undefined]}
                        secureTextEntry
                      />
                  case ContentTypes.TEXT:
                    return (
                      <Text
                        key={i}
                        style={[textStyles.previewParagraph, themeColors[colorScheme].confirmationMessage, i > 0 ? styles.marginTop : undefined]}
                      >
                        {content.text}
                      </Text>
                    )
                  case ContentTypes.BUTTON:
                    return (
                      <SubmitButton
                        key={i}
                        onPress={() => content.createAction && dispatch(content.createAction({emailInput, passwordInput, passwordConfirmInput}))}
                        offBgColorRGB={submitButtonOffBgColor[content.variant]}
                        onBgColorRGB={submitButtonOnBgColor[content.variant]}
                        isLoading={authState.isLoading}
                        label={content.label}
                        serverErrorMessage={authState.serverErrorMessage}
                        style={[i > 0 ? styles.marginTop : undefined]}
                      />
                    )
                  case ContentTypes.LINK:
                    return (
                      <TouchableOpacity key={i} onPress={() => dispatch(content.createAction())}>
                        <Text style={[styles.link, textStyles.link, themeColors[colorScheme].link, i > 0 ? styles.marginTop : undefined]}>{content.label}</Text>
                      </TouchableOpacity>
                    )
                }
              })}
            </View>
          </>
          : <View>
            <Text style={[styles.marginTop, textStyles.previewParagraph, doneText.isError ? {color: colors.Red} : themeColors[colorScheme].confirmationMessage]}>{doneText.text}</Text>
            <ButtonWithHoverColorAnimation onPress={() => dispatch(dismissAuthModal())} offBgColorRGB={colors.Orange} onBgColorRGB={colors.OrangeHover} style={[styles.button, styles.marginTop]} childrenWrapperStyle={styles.buttonContents}>
              <Text style={[styles.buttonLabel, textStyles.headingM]}>OK</Text>
            </ButtonWithHoverColorAnimation>
          </View>
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
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={[styles.inputUnderline, themeColors[colorScheme].modalBackgroundColor]} />
      {errorMessage && <Text style={[styles.errorMessage, styles.inputErrorMessage]}>{errorMessage}</Text>}
    </View>
  )
}

const SubmitButton = (props: {
  onPress: () => void
  offBgColorRGB: ColorValue
  onBgColorRGB: ColorValue
  isLoading: boolean
  label: string
  serverErrorMessage: string | null
  style?: StyleProp<ViewStyle>
}) => {
  const {
    onPress,
    offBgColorRGB,
    onBgColorRGB,
    isLoading,
    label,
    serverErrorMessage,
    style,
  } = props

  return (
    <View>
      <ButtonWithHoverColorAnimation
        onPress={onPress}
        offBgColorRGB={offBgColorRGB}
        onBgColorRGB={onBgColorRGB}
        style={[styles.button, style]}
        childrenWrapperStyle={styles.buttonContents}
        disabled={isLoading}
      >
        {isLoading
          ? <View style={styles.loaderContainer}>
            <LoadingCircles circleColorRGB="rgb(255,255,255)" />
          </View>
          : <Text style={[styles.buttonLabel, textStyles.headingM]}>
            {label}
          </Text>
        }
      </ButtonWithHoverColorAnimation>
      {serverErrorMessage &&
        <Text style={[styles.serverErrorMessage, styles.errorMessage]}>{serverErrorMessage}</Text>
      }
    </View>
  )
}
