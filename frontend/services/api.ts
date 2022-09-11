import { DocumentsRequest, DocumentsUploadResponse } from '@api/document';
import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { AUTH_TOKEN_KEY } from '../constants';
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

export const setTokenToRequestHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common[AUTH_TOKEN_KEY] = token
  } else {
    delete axios.defaults.headers.common[AUTH_TOKEN_KEY]
  }
}

export const signup = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string}>> => {
  console.log('TODO: Implement asking API.')
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

export const login = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string, token: string}>> => {
  console.log('TODO: Implement asking API.')
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
  console.log('TODO: Share path.')
  const response = await axios.post<DocumentsUploadResponse>('/api/documents', requestBody)
  return response.data
}
