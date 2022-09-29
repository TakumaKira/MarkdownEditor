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
}

export const confirmSignupEmail = async (credentials: {token: string}): Promise<AxiosResponse<{message: string, token: string}>> => {
  return await axios.post<{message: string, token: string}>(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path, credentials)
}

export const login = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string, token: string}>> => {
  return await axios.post<{message: string, token: string}>(API_PATHS.AUTH.LOGIN.path, credentials)
}

export const editUser = async (credentials: {email?: string, password?: string}): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<{message: string}>(API_PATHS.AUTH.EDIT.path, credentials)
}

export const confirmChangeEmail = async (credentials: {token: string, password: string}): Promise<AxiosResponse<{message: string, token: string}>> => {
  return await axios.post<{message: string, token: string}>(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path, credentials)
}

export const upload = async (documentState: DocumentState): Promise<DocumentsUploadResponse> => {
  const requestBody: DocumentsRequest = {
    updated: documentState.documentList.filter(({isUploaded}) => !isUploaded).map(({isUploaded, ...rest}) => rest),
    latestUpdatedDocumentFromDBAt: documentState.latestUpdatedDocumentFromDBAt
  }
  const response = await axios.post<DocumentsUploadResponse>(API_PATHS.DOCUMENTS.path, requestBody)
  return response.data
}
