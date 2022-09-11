import { DocumentsRequest, DocumentsUploadResponse } from '@api/document';
import axios from 'axios';
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

export const upload = async (documentState: DocumentState): Promise<DocumentsUploadResponse> => {
  const requestBody: DocumentsRequest = {
    updated: documentState.documentList.filter(({isUploaded}) => !isUploaded).map(({isUploaded, ...rest}) => rest),
    latestUpdatedDocumentFromDBAt: documentState.latestUpdatedDocumentFromDBAt
  }
  const response = await axios.post<DocumentsUploadResponse>('/api/documents', requestBody)
  return response.data
}
