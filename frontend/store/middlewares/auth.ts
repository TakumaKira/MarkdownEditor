import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { MIN_PASSWORD_LENGTH } from '../../constants';
import { AuthStateConfirmChangeEmail, AuthStateConfirmResetPassword } from '../models/user';
import { askServerConfirmChangeEmail, askServerConfirmResetPassword, askServerConfirmSignupEmail, askServerEdit, askServerLogin, askServerResetPassword, askServerSignup, AuthStateTypes, callAuthModal, submitConfirmNewEmail, submitEdit, submitLogin, submitNewPassword, submitResetPassword, submitSignup, validationError } from '../slices/user';

enum SubmitTypes {
  SIGNUP = 'signup',
  LOGIN = 'login',
  EDIT = 'edit',
  CONFIRM_CHANGE_EMAIL = 'confirmChangeEmail',
  RESET_PASSWORD = 'resetPassword',
  CONFIRM_RESET_PASSWORD = 'confirmResetPassword',
}

export const authMiddleware: ThunkMiddleware<RootState, AnyAction> = store => next => action => {
  next(action)

  if (
    action.type === submitSignup.type
  ) {
    const _action = action as ReturnType<typeof submitSignup>
    const {email, password, passwordConfirm} = _action.payload
    const {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage} = validate({type: SubmitTypes.SIGNUP, params: {email, password, passwordConfirm}})
    if (emailValidationErrorMessage || passwordValidationErrorMessage || passwordConfirmValidationErrorMessage) {
      next(validationError({emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}))
    } else {
      store.dispatch(askServerSignup({email, password}))
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
    const {email, password} = _action.payload
    const {emailValidationErrorMessage, passwordValidationErrorMessage} = validate({type: SubmitTypes.LOGIN, params: {email, password}})
    if (emailValidationErrorMessage || passwordValidationErrorMessage) {
      next(validationError({emailValidationErrorMessage, passwordValidationErrorMessage}))
    } else {
      store.dispatch(askServerLogin(_action.payload))
    }
  }

  if (
    action.type === submitEdit.type
  ) {
    const _action = action as ReturnType<typeof submitEdit>
    const {email: newEmail, password, passwordConfirm}= _action.payload
    const {email: oldEmail} = store.getState().user
    const {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage} = validate({type: SubmitTypes.EDIT, params: {oldEmail: oldEmail!, newEmail, password, passwordConfirm}})
    if (emailValidationErrorMessage || passwordValidationErrorMessage || passwordConfirmValidationErrorMessage) {
      next(validationError({emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}))
    } else {
      store.dispatch(askServerEdit({email: newEmail || undefined, password: password || undefined}))
    }
  }

  if (
    action.type === submitConfirmNewEmail.type
  ) {
    const _action = action as ReturnType<typeof submitConfirmNewEmail>
    const {password} = _action.payload
    const {token} = store.getState().user.authState as AuthStateConfirmChangeEmail
    const {passwordValidationErrorMessage} = validate({type: SubmitTypes.CONFIRM_CHANGE_EMAIL, params: {password}})
    if (passwordValidationErrorMessage) {
      next(validationError({passwordValidationErrorMessage}))
    } else {
      store.dispatch(askServerConfirmChangeEmail({token, password}))
    }
  }

  if (
    action.type === submitResetPassword.type
  ) {
    const _action = action as ReturnType<typeof submitResetPassword>
    const {email} = _action.payload
    const {emailValidationErrorMessage} = validate({type: SubmitTypes.RESET_PASSWORD, params: {email}})
    if (emailValidationErrorMessage) {
      next(validationError({emailValidationErrorMessage}))
    } else {
      store.dispatch(askServerResetPassword({email}))
    }
  }

  if (
    action.type === submitNewPassword.type
  ) {
    const _action = action as ReturnType<typeof submitNewPassword>
    const {password, passwordConfirm} = _action.payload
    const {token} = store.getState().user.authState as AuthStateConfirmResetPassword
    const {passwordValidationErrorMessage, passwordConfirmValidationErrorMessage} = validate({type: SubmitTypes.CONFIRM_RESET_PASSWORD, params: {password, passwordConfirm}})
    if (passwordValidationErrorMessage || passwordConfirmValidationErrorMessage) {
      next(validationError({passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}))
    } else {
      store.dispatch(askServerConfirmResetPassword({token, password}))
    }
  }
}
function validate(args: {type: SubmitTypes.SIGNUP, params: Parameters<typeof validateSignup>[0]}): ReturnType<typeof validateSignup>
function validate(args: {type: SubmitTypes.LOGIN, params: Parameters<typeof validateLogin>[0]}): ReturnType<typeof validateLogin>
function validate(args: {type: SubmitTypes.EDIT, params: Parameters<typeof validateEdit>[0]}): ReturnType<typeof validateEdit>
function validate(args: {type: SubmitTypes.CONFIRM_CHANGE_EMAIL, params: Parameters<typeof validateConfirmChangeEmail>[0]}): ReturnType<typeof validateConfirmChangeEmail>
function validate(args: {type: SubmitTypes.RESET_PASSWORD, params: Parameters<typeof validateResetPassword>[0]}): ReturnType<typeof validateResetPassword>
function validate(args: {type: SubmitTypes.CONFIRM_RESET_PASSWORD, params: Parameters<typeof validateConfirmResetPassword>[0]}): ReturnType<typeof validateConfirmResetPassword>
function validate(args:
  {type: SubmitTypes.SIGNUP, params: Parameters<typeof validateSignup>[0]}
  | {type: SubmitTypes.LOGIN, params: Parameters<typeof validateLogin>[0]}
  | {type: SubmitTypes.EDIT, params: Parameters<typeof validateEdit>[0]}
  | {type: SubmitTypes.CONFIRM_CHANGE_EMAIL, params: Parameters<typeof validateConfirmChangeEmail>[0]}
  | {type: SubmitTypes.RESET_PASSWORD, params: Parameters<typeof validateResetPassword>[0]}
  | {type: SubmitTypes.CONFIRM_RESET_PASSWORD, params: Parameters<typeof validateConfirmResetPassword>[0]}
): ReturnType<typeof validateSignup>
  | ReturnType<typeof validateLogin>
  | ReturnType<typeof validateEdit>
  | ReturnType<typeof validateConfirmChangeEmail>
  | ReturnType<typeof validateResetPassword>
  | ReturnType<typeof validateConfirmResetPassword> {
  switch (args.type) {
    case SubmitTypes.SIGNUP:
      return validateSignup(args.params)
    case SubmitTypes.LOGIN:
      return validateLogin(args.params)
    case SubmitTypes.EDIT:
      return validateEdit(args.params)
    case SubmitTypes.CONFIRM_CHANGE_EMAIL:
      return validateConfirmChangeEmail(args.params)
    case SubmitTypes.RESET_PASSWORD:
      return validateResetPassword(args.params)
    case SubmitTypes.CONFIRM_RESET_PASSWORD:
      return validateConfirmResetPassword(args.params)
  }
}
function validateSignup(params: {email: string, password: string, passwordConfirm: string}): {emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage: string | null} {
  const {email, password, passwordConfirm} = params
  const emailValidationErrorMessage = _validate('Email', email, {required: true, isEmail: true})
  const passwordValidationErrorMessage = _validate('Password', password, {required: true, minLength: MIN_PASSWORD_LENGTH})
  const passwordConfirmValidationErrorMessage = _validate('Password (Confirm)', passwordConfirm, {required: true, matchWith: {label: 'Password', input: password}})
  return {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}
}
function validateLogin(params: {email: string, password: string}): {emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null} {
  const {email, password} = params
  const emailValidationErrorMessage = _validate('Email', email, {required: true, isEmail: true})
  const passwordValidationErrorMessage = _validate('Password', password, {required: true})
  return {emailValidationErrorMessage, passwordValidationErrorMessage}
}
export const NEEDS_AT_LEAST_EMAIL_OR_PASSWORD = 'Needs at least email or password.'
function validateEdit(params: {oldEmail: string, newEmail: string, password: string, passwordConfirm: string}): {emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage: string | null} {
  const {oldEmail, newEmail, password, passwordConfirm} = params
  if (newEmail === '' && password === '' && passwordConfirm === '') {
    return {emailValidationErrorMessage: NEEDS_AT_LEAST_EMAIL_OR_PASSWORD, passwordValidationErrorMessage: NEEDS_AT_LEAST_EMAIL_OR_PASSWORD, passwordConfirmValidationErrorMessage: NEEDS_AT_LEAST_EMAIL_OR_PASSWORD}
  }
  const emailValidationErrorMessage = oldEmail !== newEmail ? _validate('Email', newEmail, {isEmail: true}) : 'Email is not changed.'
  const passwordValidationErrorMessage = _validate('Password', password, {minLength: MIN_PASSWORD_LENGTH})
  const passwordConfirmValidationErrorMessage = _validate('Password (Confirm)', passwordConfirm, {matchWith: {label: 'Password', input: password}})
  return {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}
}
function validateConfirmChangeEmail(params: {password: string}): {passwordValidationErrorMessage: string | null} {
  const {password} = params
  const passwordValidationErrorMessage = _validate('Password', password, {required: true, minLength: MIN_PASSWORD_LENGTH})
  return {passwordValidationErrorMessage}
}
function validateResetPassword(params: {email: string}): {emailValidationErrorMessage: string | null} {
  const {email} = params
  const emailValidationErrorMessage = _validate('Email', email, {required: true, isEmail: true})
  return {emailValidationErrorMessage}
}
function validateConfirmResetPassword(params: {password: string, passwordConfirm: string}): {passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage: string | null} {
  const {password, passwordConfirm} = params
  const passwordValidationErrorMessage = _validate('Password', password, {required: true, minLength: MIN_PASSWORD_LENGTH})
  const passwordConfirmValidationErrorMessage = _validate('Password (Confirm)', passwordConfirm, {required: true, matchWith: {label: 'Password', input: password}})
  return {passwordValidationErrorMessage, passwordConfirmValidationErrorMessage}
}
function _validate(label: string, input: string, options?: {required?: boolean, minLength?: number, isEmail?: boolean, matchWith?: {label: string, input: string}}): string | null {
  if (options?.required && input === '') {
    return `${label} is required.`
  }
  if (options?.minLength && input !== '' && input.length < options.minLength) {
    return `${label} must be at least ${options.minLength} characters.`
  }
  if (options?.isEmail && input && !isEmail(input)) {
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
