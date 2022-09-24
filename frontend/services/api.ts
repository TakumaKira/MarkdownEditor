import { DocumentsRequest, DocumentsUploadResponse } from '@api/document';
import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { API_PATHS, AUTH_TOKEN_KEY } from '../constants';
import { DocumentState } from "../store/models/document";

const ORIGIN = Constants.manifest?.extra?.ORIGIN
if (!ORIGIN) {
  throw new Error('ORIGIN is not defined.')
}
const API_PORT = Number(Constants.manifest?.extra?.API_PORT)
if (!API_PORT) {
  throw new Error('API_PORT is not defined.')
}
// TODO: Make this https
axios.defaults.baseURL = `http://${ORIGIN}:${API_PORT}`

axios.interceptors.response.use(
  response => response,
  error => {
    if ((error as AxiosError<{message: string}>).response?.data.message) {
      // API server respond with error message.
      return Promise.reject(error.response.data.message)
    }
    if (error.request.status === 0) {
      // Network error(Server not respond).
      return Promise.reject('Server not respond. Please check internet connection and try again later.')
    }
    return Promise.reject('Something went wrong.')
  }
)

export const setTokenToRequestHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common[AUTH_TOKEN_KEY] = token
  } else {
    delete axios.defaults.headers.common[AUTH_TOKEN_KEY]
  }
}

export const signup = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<{message: string}>(API_PATHS.AUTH.SIGNUP.path, credentials)

  // Use below to mock API.
  return new Promise<AxiosResponse<{message: string}>>((resolve, reject) => {
    const hasError = false
    if (!hasError) {
      const response: AxiosResponse<{message: string}> = {data: {message: 'Confirmation email sent.'}, status: 200, statusText: 'OK', headers: {}, config: {}}
      setTimeout(() => resolve(response), 3000)
    } else {
      const error: AxiosError<{message: string}> = {response: {data: {message: 'Email is already registered.'}, status: 401, statusText: 'Unauthorized', headers: {}, config: {}}, message: '', config: {}, isAxiosError: true, toJSON: () => ({}), name: ''}
      setTimeout(() => reject(error), 3000)
    }
  })
}

export const confirmSignupEmail = async (credentials: {token: string}): Promise<AxiosResponse<{message: string, token: string}>> => {
  return await axios.post<{message: string, token: string}>(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path, credentials)
}

export const login = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string, token: string}>> => {
  return await axios.post<{message: string, token: string}>(API_PATHS.AUTH.LOGIN.path, credentials)

  // Use below to mock API.
  return new Promise<AxiosResponse<{message: string, token: string}>>((resolve, reject) => {
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
}

export const upload = async (documentState: DocumentState): Promise<DocumentsUploadResponse> => {
  const requestBody: DocumentsRequest = {
    updated: documentState.documentList.filter(({isUploaded}) => !isUploaded).map(({isUploaded, ...rest}) => rest),
    latestUpdatedDocumentFromDBAt: documentState.latestUpdatedDocumentFromDBAt
  }
  const response = await axios.post<DocumentsUploadResponse>(API_PATHS.DOCUMENTS.path, requestBody)
  return response.data
}
