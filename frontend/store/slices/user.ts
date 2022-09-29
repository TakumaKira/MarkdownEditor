import { UserInfoOnToken } from "@api/user";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwt from 'jsonwebtoken';
import { AuthStateTypes } from "../../components/AuthModal";
import { confirmChangeEmail, confirmSignupEmail, editUser, login, signup } from "../../services/api";
import { getData } from "../../services/asyncStorage";
import { AuthStateConfirmChangeEmail, AuthStateConfirmSignupEmail, AuthStateDelete, AuthStateEdit, AuthStateLogin, AuthStateSignup, UserState } from "../models/user";

const initialState: UserState = {
  token: null,
  email: null,
  authState: null,
  restoreIsDone: false
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
    return {successMessage: response.data.message, token: response.data.token}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerLogin = createAsyncThunk('user/askServerLogin', async (payload: {email: string, password: string}) => {
  try {
    const response = await login(payload)
    return {token: response.data.token}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerEdit = createAsyncThunk('user/askServerEdit', async (payload: {email?: string, password?: string}) => {
  try {
    const response = await editUser(payload)
    return {successMessage: response.data.message}
  } catch (err) {
    return Promise.reject(err)
  }
})
export const askServerConfirmChangeEmail = createAsyncThunk('user/askServerConfirmChangeEmail', async (payload: {token: string, password: string}) => {
  try {
    const response = await confirmChangeEmail(payload)
    return {successMessage: response.data.message, token: response.data.token}
  } catch (err) {
    return Promise.reject(err)
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    callAuthModal: (state, action: PayloadAction<
      {authStateType: AuthStateTypes.SIGNUP | AuthStateTypes.LOGIN | AuthStateTypes.EDIT | AuthStateTypes.DELETE}
      | {authStateType: AuthStateTypes.CONFIRM_SIGNUP_EMAIL | AuthStateTypes.CONFIRM_CHANGE_EMAIL, token: string}
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
    validationError: (state, action: PayloadAction<{emailValidationErrorMessage?: string | null, passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage?: string | null}>) => {
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
    removeLoginToken: state => {
      state.token = null
      state.email = null
    },
  },
  extraReducers: builder => {
    builder.addCase(restoreUser.fulfilled, (state, action) => {
      const restored = action.payload
      if (restored) {
        try {
          // TODO: Test automatically check to not miss restoring any property.
          state.token = restored.token
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
      if (state.authState && errorMessage) {
        state.authState.serverErrorMessage = errorMessage
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerConfirmSignupEmail.fulfilled, (state, action) => {
      const token = action.payload.token as string
      try {
        const {email} = jwt.decode(token) as UserInfoOnToken
        state.token = token
        state.email = email
        if (state.authState) {
          state.authState.isLoading = false
          state.authState.isDone = true
        }
      } catch (err) {
        console.log(err)
      }
    })
    builder.addCase(askServerConfirmSignupEmail.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState && errorMessage) {
        state.authState.serverErrorMessage = errorMessage
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
      const token = action.payload.token as string
      try {
        const {email} = jwt.decode(token) as UserInfoOnToken
        state.token = token
        state.email = email
        if (state.authState) {
          state.authState.isLoading = false
          state.authState.isDone = true
        }
      } catch (err) {
        console.log(err)
      }
    })
    builder.addCase(askServerLogin.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState && errorMessage) {
        state.authState.serverErrorMessage = errorMessage
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerEdit.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerEdit.fulfilled, state => {
      if (state.authState) {
        state.authState.isLoading = false
        state.authState.isDone = true
      }
    })
    builder.addCase(askServerEdit.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState && errorMessage) {
        state.authState.serverErrorMessage = errorMessage
        state.authState.isLoading = false
      }
    })
    builder.addCase(askServerConfirmChangeEmail.pending, state => {
      if (state.authState) {
        state.authState.isLoading = true
      }
    })
    builder.addCase(askServerConfirmChangeEmail.fulfilled, (state, action) => {
      const token = action.payload.token as string
      try {
        const {email} = jwt.decode(token) as UserInfoOnToken
        state.token = token
        state.email = email
        if (state.authState) {
          state.authState.isLoading = false
          state.authState.isDone = true
        }
      } catch (err) {
        console.log(err)
      }
    })
    builder.addCase(askServerConfirmChangeEmail.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState && errorMessage) {
        state.authState.serverErrorMessage = errorMessage
        state.authState.isLoading = false
        state.authState.isDone = errorMessage !== 'Password is incorrect.'
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
  validationError,
  removeLoginToken,
} = userSlice.actions

export default userSlice.reducer
