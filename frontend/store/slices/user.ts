import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { confirmChangeEmail, confirmResetPassword, confirmSignupEmail, deleteUser, editUser, login, resetPassword, signup } from "../../services/api";
import { getData } from "../../services/asyncStorage";
import { AuthStateConfirmChangeEmail, AuthStateConfirmResetPassword, AuthStateConfirmSignupEmail, AuthStateDelete, AuthStateEdit, AuthStateLogin, AuthStateResetPassword, AuthStateSignup, UserState } from "../models/user";
import { WS_HANDSHAKE_TOKEN_KEY } from "../../constants";

const initialState: UserState = {
  email: null,
  wsHandshakeToken: null,
  authState: null,
  restoreIsDone: false,
  firstSyncIsDone: false,
}
export enum AuthStateTypes {
  SIGNUP = 'signup',
  CONFIRM_SIGNUP_EMAIL = 'confirmSignupEmail',
  LOGIN = 'login,',
  EDIT = 'edit,',
  CONFIRM_CHANGE_EMAIL = 'confirmChangeEmail',
  RESET_PASSWORD = 'resetPassword',
  CONFIRM_RESET_PASSWORD = 'confirmResetPassword',
  DELETE = 'delete,',
}
const initialAuthStateSignup: AuthStateSignup = {
  type: AuthStateTypes.SIGNUP,
  passwordConfirmValidationErrorMessage: null,
  emailValidationErrorMessage: null,
  passwordValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
}
const initialAuthStateLogin: AuthStateLogin = {
  type: AuthStateTypes.LOGIN,
  emailValidationErrorMessage: null,
  passwordValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
}
const initialConfirmStateSignup: AuthStateConfirmSignupEmail = {
  type: AuthStateTypes.CONFIRM_SIGNUP_EMAIL,
  isLoading: true,
  serverErrorMessage: null,
  isDone: false
}
const initialAuthStateEdit: AuthStateEdit = {
  type: AuthStateTypes.EDIT,
  emailValidationErrorMessage: null,
  passwordValidationErrorMessage: null,
  passwordConfirmValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
}
const getInitialConfirmStateChangeEmail = (token: string): AuthStateConfirmChangeEmail => ({
  type: AuthStateTypes.CONFIRM_CHANGE_EMAIL,
  token,
  passwordValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
})
const initialAuthStateResetPassword: AuthStateResetPassword = {
  type: AuthStateTypes.RESET_PASSWORD,
  emailValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
}
const getInitialConfirmStateResetPassword = (token: string): AuthStateConfirmResetPassword => ({
  type: AuthStateTypes.CONFIRM_RESET_PASSWORD,
  token,
  passwordValidationErrorMessage: null,
  passwordConfirmValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
})
const initialAuthStateDelete: AuthStateDelete = {
  type: AuthStateTypes.DELETE,
  isLoading: false,
  serverErrorMessage: null,
  isDone: false
}

export const restoreUser = createAsyncThunk('user/restoreUser', () => {
  return getData('user')
})
export const askServerSignup = createAsyncThunk('user/askServerSignup', async (payload: {email: string, password: string}) => {
  try {
    const response = await signup(payload)
    return {successMessage: response.data.message}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerConfirmSignupEmail = createAsyncThunk('user/askServerConfirmSignupEmail', async (payload: {token: string}) => {
  try {
    const response = await confirmSignupEmail(payload)
    return {successMessage: response.data.message, email: response.data.email, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY]}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerLogin = createAsyncThunk('user/askServerLogin', async (payload: {email: string, password: string}) => {
  try {
    const response = await login(payload)
    return {email: payload.email, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY]}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerEdit = createAsyncThunk('user/askServerEdit', async (payload: {email?: string, password?: string}) => {
  try {
    const response = await editUser(payload)
    return {successMessage: response.data.message, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY]}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerConfirmChangeEmail = createAsyncThunk('user/askServerConfirmChangeEmail', async (payload: {token: string, password: string}) => {
  try {
    const response = await confirmChangeEmail(payload)
    return {successMessage: response.data.message, email: response.data.email, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY]}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerResetPassword = createAsyncThunk('user/askServerResetPassword', async (payload: {email: string}) => {
  try {
    const response = await resetPassword(payload)
    return {successMessage: response.data.message, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY]}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerConfirmResetPassword = createAsyncThunk('user/askServerConfirmResetPassword', async (payload: {token: string, password: string}) => {
  try {
    const response = await confirmResetPassword(payload)
    return {successMessage: response.data.message, email: response.data.email, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY]}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerDeleteAccount = createAsyncThunk('user/askServerDeleteAccount', async () => {
  try {
    const response = await deleteUser()
    return {successMessage: response.data.message}
  } catch (err) {
    return Promise.reject(err)
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    callAuthModal: (state, action: PayloadAction<
      {authStateType: AuthStateTypes.SIGNUP | AuthStateTypes.LOGIN | AuthStateTypes.EDIT | AuthStateTypes.RESET_PASSWORD | AuthStateTypes.DELETE}
      | {authStateType: AuthStateTypes.CONFIRM_SIGNUP_EMAIL | AuthStateTypes.CONFIRM_CHANGE_EMAIL | AuthStateTypes.CONFIRM_RESET_PASSWORD, token: string}
    >) => {
      switch (action.payload.authStateType) {
        case AuthStateTypes.SIGNUP:
          state.authState = initialAuthStateSignup
          break
        case AuthStateTypes.LOGIN:
          state.authState = initialAuthStateLogin
          break
        case AuthStateTypes.CONFIRM_SIGNUP_EMAIL:
          state.authState = initialConfirmStateSignup
          break
        case AuthStateTypes.EDIT:
          state.authState = initialAuthStateEdit
          break
        case AuthStateTypes.CONFIRM_CHANGE_EMAIL:
          state.authState = getInitialConfirmStateChangeEmail(action.payload.token)
          break
        case AuthStateTypes.RESET_PASSWORD:
          state.authState = initialAuthStateResetPassword
          break
        case AuthStateTypes.CONFIRM_RESET_PASSWORD:
          state.authState = getInitialConfirmStateResetPassword(action.payload.token)
          break
        case AuthStateTypes.DELETE:
          state.authState = initialAuthStateDelete
          break
      }
    },
    dismissAuthModal: state => {
      state.authState = null
    },
    resetErrorMessage: (state, action: PayloadAction<'email' | 'password' | 'passwordConfirm' | 'server'>) => {
      if (state.authState) {
        switch (action.payload) {
          case 'email':
            if ('emailValidationErrorMessage' in state.authState) {
              state.authState.emailValidationErrorMessage = null
            }
            break
          case 'password':
            if ('passwordValidationErrorMessage' in state.authState) {
              state.authState.passwordValidationErrorMessage = null
            }
            break
          case 'passwordConfirm':
            if ('passwordConfirmValidationErrorMessage' in state.authState) {
              state.authState.passwordConfirmValidationErrorMessage = null
            }
            break
          case 'server':
            state.authState.serverErrorMessage = null
            break
        }
      }
    },
    submitSignup: (state, action: PayloadAction<{email: string, password: string, passwordConfirm: string}>) => {},
    submitLogin: (state, action: PayloadAction<{email: string, password: string}>) => {},
    submitEdit: (state, action: PayloadAction<{email: string, password: string, passwordConfirm: string}>) => {},
    submitConfirmNewEmail: (state, action: PayloadAction<{password: string}>) => {},
    submitResetPassword: (state, action: PayloadAction<{email: string}>) => {},
    submitNewPassword: (state, action: PayloadAction<{password: string, passwordConfirm: string}>) => {},
    validationError: (state, action: PayloadAction<{emailValidationErrorMessage?: string | null, passwordValidationErrorMessage?: string | null, passwordConfirmValidationErrorMessage?: string | null}>) => {
      const {authState} = state
      const {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage} = action.payload
      if (authState) {
        if ('emailValidationErrorMessage' in authState && emailValidationErrorMessage) {
          authState.emailValidationErrorMessage = emailValidationErrorMessage
        }
        if ('passwordValidationErrorMessage' in authState && passwordValidationErrorMessage) {
          authState.passwordValidationErrorMessage = passwordValidationErrorMessage
        }
        if ('passwordConfirmValidationErrorMessage' in authState && passwordConfirmValidationErrorMessage) {
          authState.passwordConfirmValidationErrorMessage = passwordConfirmValidationErrorMessage
        }
      }
    },
    updateWsHandshakeToken: (state, action: PayloadAction<{wsHandshakeToken: string, isFirstAfterLogin: boolean | undefined}>) => {
      state.wsHandshakeToken = action.payload.wsHandshakeToken
    },
    firstSyncIsDone: state => {
      state.firstSyncIsDone = true
    },
    logout: state => {
      state.email = null
      state.wsHandshakeToken = null
      state.firstSyncIsDone = false
    },
  },
  extraReducers: builder => {
    builder.addCase(restoreUser.fulfilled, (state, action) => {
      const restored = action.payload
      if (restored) {
        try {
          state.email = restored.email
        } catch (err) {
          console.error(err)
        }
      }
      state.restoreIsDone = true
    })
    builder.addCase(askServerSignup.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerSignup.fulfilled, state => {
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerSignup.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerConfirmSignupEmail.fulfilled, (state, action) => {
      const { email, wsHandshakeToken } = action.payload
      state.email = email
      state.wsHandshakeToken = wsHandshakeToken
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerConfirmSignupEmail.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerLogin.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerLogin.fulfilled, (state, action) => {
      const { email, wsHandshakeToken } = action.payload
      state.email = email
      state.wsHandshakeToken = wsHandshakeToken
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerLogin.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerEdit.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerEdit.fulfilled, (state, action) => {
      const { wsHandshakeToken } = action.payload
      state.wsHandshakeToken = wsHandshakeToken
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerEdit.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerConfirmChangeEmail.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerConfirmChangeEmail.fulfilled, (state, action) => {
      const { email, wsHandshakeToken } = action.payload
      state.email = email
      state.wsHandshakeToken = wsHandshakeToken
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerConfirmChangeEmail.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
        state.authState.isDone = errorMessage !== 'Password is incorrect.'
      }
    })
    builder.addCase(askServerResetPassword.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerResetPassword.fulfilled, (state, action) => {
      const { wsHandshakeToken } = action.payload
      state.wsHandshakeToken = wsHandshakeToken
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerResetPassword.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerConfirmResetPassword.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerConfirmResetPassword.fulfilled, (state, action) => {
      const { email, wsHandshakeToken } = action.payload
      state.email = email
      state.wsHandshakeToken = wsHandshakeToken
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerConfirmResetPassword.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerDeleteAccount.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerDeleteAccount.fulfilled, state => {
      state.email = null
      state.wsHandshakeToken = null
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerDeleteAccount.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState) {
        state.authState.serverErrorMessage = errorMessage || 'Something went wrong.'
        state.authState.isLoading = false
      }
    })
  }
})

export const {
  callAuthModal,
  dismissAuthModal,
  resetErrorMessage,
  submitSignup,
  submitLogin,
  submitEdit,
  submitConfirmNewEmail,
  submitResetPassword,
  submitNewPassword,
  validationError,
  updateWsHandshakeToken,
  firstSyncIsDone,
  logout,
} = userSlice.actions

export default userSlice.reducer
