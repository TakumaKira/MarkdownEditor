import { AnyAction, Dispatch, ThunkDispatch } from '@reduxjs/toolkit'
import React from 'react'
import { ColorValue, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { RootState } from '../store'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { NEEDS_AT_LEAST_EMAIL_OR_PASSWORD } from '../store/middlewares/auth'
import { selectColorScheme } from '../store/slices/theme'
import { dismissAuthModal, resetErrorMessage, submitConfirmNewEmail, submitEdit, submitLogin, submitSignup } from '../store/slices/user'
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
  CONFIRM_SIGNUP_EMAIL = 'confirmSignupEmail',
  LOGIN = 'login,',
  EDIT = 'edit,',
  CONFIRM_CHANGE_EMAIL = 'confirmChangeEmail',
  DELETE = 'delete,',
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
  marginTop: {
    marginTop: 18,
  },
})

enum ContentTypes {
  EMAIL_INPUT = 'emailInput',
  PASSWORD_INPUT = 'passwordInput',
  PASSWORD_CONFIRM_INPUT = 'passwordConfirmInput',
  TEXT = 'text',
}
const authModalSettings: {[type in AuthStateTypes]: {
  title: string
  contents: ({type: ContentTypes.EMAIL_INPUT | ContentTypes.PASSWORD_INPUT | ContentTypes.PASSWORD_CONFIRM_INPUT} | {type: ContentTypes.TEXT, text: string})[]
  submitButton: {label: string, variant: 'primary' | 'danger'}
  handleSubmit?: (dispatch: ThunkDispatch<RootState, undefined, AnyAction> & Dispatch<AnyAction>, inputs: {emailInput: string, passwordInput: string, passwordConfirmInput: string}) => void
  getDoneText: (option?: string) => {text: string, isError?: boolean}
}} = {
  [AuthStateTypes.SIGNUP]: {
    title: 'Signup',
    contents: [
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.PASSWORD_CONFIRM_INPUT},
    ],
    submitButton: {label: 'Signup', variant: 'primary'},
    handleSubmit: (dispatch, {emailInput, passwordInput, passwordConfirmInput}) => dispatch(submitSignup({email: emailInput, password: passwordInput, passwordConfirm: passwordConfirmInput})),
    getDoneText: email => ({text: `Confirmation email was sent to ${email}.\nPlease confirm to login.`}),
  },
  [AuthStateTypes.CONFIRM_SIGNUP_EMAIL]: {
    title: 'Confirm your email',
    contents: [
      {type: ContentTypes.TEXT, text: 'Confirming your email...'},
    ],
    submitButton: {label: '', variant: 'primary'},
    getDoneText: errorMessage => (errorMessage ? {text: errorMessage, isError: true} : {text: 'Your email is confirmed successfully.'}),
  },
  [AuthStateTypes.LOGIN]: {
    title: 'Login',
    contents: [
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.PASSWORD_INPUT},
    ],
    submitButton: {label: 'Login', variant: 'primary'},
    handleSubmit: (dispatch, {emailInput, passwordInput}) => dispatch(submitLogin({email: emailInput, password: passwordInput})),
    getDoneText: () => ({text: 'Successfully logged in.'}),
  },
  [AuthStateTypes.EDIT]: {
    title: 'Edit email/password',
    contents: [
      {type: ContentTypes.TEXT, text: "You can leave forms where you don't want to change."},
      {type: ContentTypes.EMAIL_INPUT},
      {type: ContentTypes.PASSWORD_INPUT},
      {type: ContentTypes.PASSWORD_CONFIRM_INPUT},
    ],
    submitButton: {label: 'Save edit', variant: 'primary'},
    handleSubmit: (dispatch, {emailInput, passwordInput, passwordConfirmInput}) => dispatch(submitEdit({email: emailInput, password: passwordInput, passwordConfirm: passwordConfirmInput})),
    getDoneText: successMessage => ({text: successMessage!}),
  },
  [AuthStateTypes.CONFIRM_CHANGE_EMAIL]: {
    title: 'Confirm new email',
    contents: [
      {type: ContentTypes.TEXT, text: 'Please enter your password to confirm new email.'},
      {type: ContentTypes.PASSWORD_INPUT},
    ],
    submitButton: {label: 'Confirm', variant: 'primary'},
    handleSubmit: (dispatch, {passwordInput}) => dispatch(submitConfirmNewEmail({password: passwordInput})),
    getDoneText: errorMessage => (errorMessage ? {text: errorMessage, isError: true} : {text: 'Successfully confirmed.'}),
  },
  [AuthStateTypes.DELETE]: {
    title: 'Delete account',
    contents: [
      {type: ContentTypes.TEXT, text: 'Are you really sure you want to delete this account?'},
    ],
    submitButton: {label: 'Delete', variant: 'danger'},
    getDoneText: () => ({text: ''}),
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

  const handleSubmit = () => {
    settings.handleSubmit?.(dispatch, {emailInput, passwordInput, passwordConfirmInput})
  }

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
      }
    return settings.getDoneText()
  }, [authState, emailInput])

  const submitButtonOffBgColor: {[key in typeof settings.submitButton.variant]: ColorValue} = {
    primary: colors.Orange,
    danger: colors.Red,
  }
  const submitButtonOnBgColor: {[key in typeof settings.submitButton.variant]: ColorValue} = {
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
                      <Input key={i} label='Email' input={emailInput} setInput={setEmailInput} errorMessage={authState.emailValidationErrorMessage} style={[i > 0 ? styles.marginTop : undefined]} />
                  case ContentTypes.PASSWORD_INPUT:
                    return 'passwordValidationErrorMessage' in authState &&
                      <Input key={i} label='Password' input={passwordInput} setInput={setPasswordInput} errorMessage={authState.passwordValidationErrorMessage} style={[i > 0 ? styles.marginTop : undefined]} secureTextEntry />
                  case ContentTypes.PASSWORD_CONFIRM_INPUT:
                    return 'passwordConfirmValidationErrorMessage' in authState &&
                      <Input key={i} label='Password (Confirm)' input={passwordConfirmInput} setInput={setPasswordConfirmInput} errorMessage={authState.passwordConfirmValidationErrorMessage} style={[i > 0 ? styles.marginTop : undefined]} secureTextEntry />
                  case ContentTypes.TEXT:
                    return <Text key={i} style={[textStyles.previewParagraph, themeColors[colorScheme].confirmationMessage, i > 0 ? styles.marginTop : undefined]}>{content.text}</Text>
                }
              })}
            </View>
            <ButtonWithHoverColorAnimation
              onPress={handleSubmit}
              offBgColorRGB={submitButtonOffBgColor[settings.submitButton.variant]}
              onBgColorRGB={submitButtonOnBgColor[settings.submitButton.variant]}
              style={styles.button}
              childrenWrapperStyle={styles.buttonContents}
              disabled={authState.isLoading}
            >
              {authState.isLoading
                ? <View style={styles.loaderContainer}>
                  <LoadingCircles circleColorRGB="rgb(255,255,255)" />
                </View>
                : <Text style={[styles.buttonLabel, textStyles.headingM]}>
                  {settings.submitButton.label}
                </Text>
              }
            </ButtonWithHoverColorAnimation>
            {authState.serverErrorMessage &&
              <Text style={[styles.serverErrorMessage, styles.errorMessage]}>{authState.serverErrorMessage}</Text>
            }
          </>
          : <>
            <Text style={[styles.marginTop, textStyles.previewParagraph, doneText.isError ? {color: colors.Red} : themeColors[colorScheme].confirmationMessage]}>{doneText.text}</Text>
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
