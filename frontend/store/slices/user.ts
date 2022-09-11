import { UserInfoOnToken } from "@api/user";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import { AuthStateTypes } from "../../components/AuthModal";
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

export const askServerSignup = createAsyncThunk('user/askServerSignup', async (paylaod: {email: string, password: string, passwordConfirm: string}) => {
  try {
    console.log('TODO: Implement asking API.')
    const response = await new Promise<AxiosResponse<{message: string}>>((resolve, reject) => {
      const hasError = false
      if (!hasError) {
        const response: AxiosResponse<{message: string}> = {data: {message: 'Confirmation email sent.'}, status: 200, statusText: 'OK', headers: {}, config: {}}
        setTimeout(() => resolve(response), 3000)
      } else {
        const error: AxiosError<{message: string}> = {response: {data: {message: 'Email is already registered.'}, status: 401, statusText: 'Unauthorized', headers: {}, config: {}}, message: '', config: {}, isAxiosError: true, toJSON: () => ({}), name: ''}
        setTimeout(() => reject(error), 3000)
      }
    })
    return {successMessage: response.data.message}
  } catch (err: any) {
    if ('response' in err) {
      throw new Error((err as AxiosError<{message: string}>).response?.data.message)
    }
    if ('message' in err) {
      console.error((err as Error).message)
    }
    console.error(err.toString())
    throw new Error('Something went wrong.')
  }
})

export const askServerLogin = createAsyncThunk('user/askServerLogin', async (paylaod: {email: string, password: string}) => {
  try {
    console.log('TODO: Implement asking API.')
    const response = await new Promise<AxiosResponse<{message: string, token: string}>>((resolve, reject) => {
      const hasError = false
      if (!hasError) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJKb2huRG9lQG1hcmtkb3duLmNvbSIsImlhdCI6MTY2MTY5NDcwNn0.dgNQF0kiFLOaL4zJl0Se_Xdrgenbsxa2ivd5J1cixBU'
        const response: AxiosResponse<{message: string, token: string}> = {data: {message: 'Login successful.', token: mockToken}, status: 200, statusText: 'OK', headers: {}, config: {}}
        setTimeout(() => resolve(response), 3000)
      } else {
        const error: AxiosError<{message: string}> = {response: {data: {message: 'Email/Password is incorrect.'}, status: 401, statusText: 'Unauthorized', headers: {}, config: {}}, message: '', config: {}, isAxiosError: true, toJSON: () => ({}), name: ''}
        setTimeout(() => reject(error), 3000)
      }
    })
    return {token: response.data.token}
  } catch (err: any) {
    if ('response' in err) {
      throw new Error((err as AxiosError<{message: string}>).response?.data.message)
    }
    if ('message' in err) {
      console.error((err as Error).message)
    }
    console.error(err.toString())
    throw new Error('Something went wrong.')
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
