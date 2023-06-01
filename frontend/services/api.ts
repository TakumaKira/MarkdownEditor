import { DocumentsUpdateRequest, DocumentsUpdateResponse } from '@api/document';
import axios, { AxiosError, AxiosResponse } from 'axios';
import env from '../env';
import { API_PATHS } from '../constants';
import { DocumentState } from "../store/models/document";

const API_PROTOCOL = env.API_PROTOCOL
if (!API_PROTOCOL) {
  throw new Error('API_PROTOCOL is not defined.')
}
const API_DOMAIN = env.API_DOMAIN
if (!API_DOMAIN) {
  throw new Error('API_DOMAIN is not defined.')
}
const API_PORT = Number(env.API_PORT)
if (!API_PORT) {
  throw new Error('API_PORT is not defined.')
}
axios.defaults.baseURL = `${API_PROTOCOL}://${API_DOMAIN}:${API_PORT}`

axios.interceptors.response.use(
  response => response,
  error => {
    if ((error as AxiosError<{message: string}>).response?.data.message) {
      // API server respond with error message.
      return Promise.reject(error.response.data.message)
    }
    if (error.request?.status === 0) {
      // Network error(Server not respond).
      return Promise.reject('Server not respond. Please check internet connection and try again later.')
    }
    return Promise.reject('Something went wrong.')
  }
)

export const signup = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<{message: string}>(API_PATHS.AUTH.SIGNUP.path, credentials)
}
export const confirmSignupEmail = async (credentials: {token: string}): Promise<AxiosResponse<{message: string, email: string}>> => {
  return await axios.post<{message: string, email: string}>(API_PATHS.AUTH.CONFIRM_SIGNUP_EMAIL.path, credentials)
}
export const login = async (credentials: {email: string, password: string}): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<{message: string}>(API_PATHS.AUTH.LOGIN.path, credentials)
}
export const editUser = async (credentials: {email?: string, password?: string}): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<{message: string}>(API_PATHS.AUTH.EDIT.path, credentials)
}
export const confirmChangeEmail = async (credentials: {token: string, password: string}): Promise<AxiosResponse<{message: string, email: string}>> => {
  return await axios.post<{message: string, email: string}>(API_PATHS.AUTH.CONFIRM_CHANGE_EMAIL.path, credentials)
}
export const resetPassword = async (credentials: {email: string}): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<{message: string}>(API_PATHS.AUTH.RESET_PASSWORD.path, credentials)
}
export const confirmResetPassword = async (credentials: {token: string, password: string}): Promise<AxiosResponse<{message: string, email: string}>> => {
  return await axios.post<{message: string, email: string}>(API_PATHS.AUTH.CONFIRM_RESET_PASSWORD.path, credentials)
}
export const deleteUser = async (): Promise<AxiosResponse<{message: string}>> => {
  return await axios.post<never>(API_PATHS.AUTH.DELETE.path)
}

export const upload = async (documentState: DocumentState): Promise<AxiosResponse<DocumentsUpdateResponse>> => {
  const requestBody: DocumentsUpdateRequest = {
    updates: documentState.documentList.filter(({isUploaded}) => !isUploaded).map(({isUploaded, ...rest}) => rest),
  }
  return await axios.post<DocumentsUpdateResponse>(API_PATHS.DOCUMENTS.path, requestBody)
}
