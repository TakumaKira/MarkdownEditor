import { UserInfoOnToken } from "@api/user";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import jwt from 'jsonwebtoken';
import { AuthStateTypes } from "../../components/AuthModal";
import { login, signup } from "../../services/api";
import { getData } from "../../services/asyncStorage";
import { AuthStateLogin, AuthStateSignup, UserState } from "../models/user";

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
  isSuccess: false
}

const initialAuthStateLogin: AuthStateLogin = {
  type: AuthStateTypes.LOGIN,
  emailValidationErrorMessage: null,
  passwordValidationErrorMessage: null,
  isLoading: false,
  serverErrorMessage: null,
  isSuccess: false
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

export const askServerLogin = createAsyncThunk('user/askServerLogin', async (payload: {email: string, password: string}) => {
  try {
    const response = await login(payload)
    return {token: response.data.token}
  } catch (err) {
    return Promise.reject(err)
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    callAuthModal: (state, action: PayloadAction<AuthStateTypes>) => {
      if (action.payload === AuthStateTypes.SIGNUP) {
        state.authState = initialAuthStateSignup
      } else {
        state.authState = initialAuthStateLogin
      }
    },
    dismissAuthModal: state => {
      state.authState = null
    },
    resetErrorMessage: (state, action: PayloadAction<'email' | 'password' | 'passwordConfirm' | 'server'>) => {
      if (state.authState) {
        switch (action.payload) {
          case 'email':
            state.authState.emailValidationErrorMessage = null
            break
          case 'password':
            state.authState.passwordValidationErrorMessage = null
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
    validationError: (state, action: PayloadAction<{emailValidationErrorMessage: string | null, passwordValidationErrorMessage: string | null, passwordConfirmValidationErrorMessage?: string | null}>) => {
      const {authState} = state
      const {emailValidationErrorMessage, passwordValidationErrorMessage, passwordConfirmValidationErrorMessage} = action.payload
      if (authState) {
        authState.emailValidationErrorMessage = emailValidationErrorMessage
        authState.passwordValidationErrorMessage = passwordValidationErrorMessage
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
        state.authState.isSuccess = true
      }
    })
    builder.addCase(askServerSignup.rejected, (state, action) => {
      const errorMessage = action.error.message
      if (state.authState && errorMessage) {
        state.authState.serverErrorMessage = errorMessage
        state.authState.isLoading = false
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
          state.authState.isSuccess = true
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
  }
})

export const {
  callAuthModal,
  dismissAuthModal,
  resetErrorMessage,
  submitSignup,
  submitLogin,
  validationError,
  removeLoginToken,
} = userSlice.actions

export default userSlice.reducer
