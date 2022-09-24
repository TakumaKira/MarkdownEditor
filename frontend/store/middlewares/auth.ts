import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { AuthStateTypes } from '../../components/AuthModal';
import { askServerConfirmSignupEmail, askServerLogin, askServerSignup, callAuthModal, submitLogin, submitSignup, validationError } from '../slices/user';

export const authMiddleware: ThunkMiddleware<RootState, AnyAction> = store => next => action => {
  next(action)

  if (
    action.type === submitSignup.type
  ) {
    const _action = action as ReturnType<typeof submitSignup>
    const {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage} = validateAll(_action.payload)
    if (emailValidationErrorMessage || passwordValidationErrorMessage || passwordConfirmValidationErrorMessage) {
      next(validationError({emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}))
    } else {
      store.dispatch(askServerSignup(_action.payload))
    }
  }

  if (
    action.type === callAuthModal.type && action.payload.authStateType === AuthStateTypes.CONFIRM_SIGNUP_EMAIL
  ) {
    const _action = action as ReturnType<typeof callAuthModal>
    if (_action.payload.authStateType === AuthStateTypes.CONFIRM_SIGNUP_EMAIL) {
      store.dispatch(askServerConfirmSignupEmail({token: _action.payload.token}))
    }
  }

  if (
    action.type === submitLogin.type
  ) {
    const _action = action as ReturnType<typeof submitLogin>
    const {emailValidationErrorMessage, passwordValidationErrorMessage} = validateAll(_action.payload)
    if (emailValidationErrorMessage || passwordValidationErrorMessage) {
      next(validationError({emailValidationErrorMessage, passwordValidationErrorMessage}))
    } else {
      store.dispatch(askServerLogin(_action.payload))
    }
  }
}

function validateAll(payload: {email: string, password: string, passwordConfirm: string}): {emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage: string | null}
function validateAll(payload: {email: string, password: string}): {emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null}
function validateAll(payload: {email: string, password: string, passwordConfirm?: string}): {emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage?: string | null} {
  const {email, password, passwordConfirm} = payload
  if (passwordConfirm !== undefined) {
    // Signup
    const emailValidationErrorMessage = validate('Email', email, {required: true, isEmail: true})
    const passwordValidationErrorMessage = validate('Password', password, {required: true, minLength: 8})
    const passwordConfirmValidationErrorMessage = validate('Password (Confirm)', passwordConfirm, {required: true, matchWith: {label: 'Password', input: password}})
    return {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}
  }

  // Login
  const emailValidationErrorMessage = validate('Email', email, {required: true, isEmail: true})
  const passwordValidationErrorMessage = validate('Password', password, {required: true})
  return {emailValidationErrorMessage, passwordValidationErrorMessage}
}
function validate(label: string, input: string, options?: {required?: boolean, minLength?: number, isEmail?: boolean, matchWith?: {label: string, input: string}}): string | null {
  if (options?.required && input === '') {
    return `${label} is required.`
  }
  if (options?.minLength && input.length < options.minLength) {
    return `${label} must be at least ${options.minLength} characters.`
  }
  if (options?.isEmail && !isEmail(input)) {
    return `${label} is not a valid email address.`
  }
  if (options?.matchWith && input !== options.matchWith.input) {
    return `${label} is not matching with ${options.matchWith.label}.`
  }
  return null
}
function isEmail(input: string): boolean {
  return /.+@.+/.test(input)
}
