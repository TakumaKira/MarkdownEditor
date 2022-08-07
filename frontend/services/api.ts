import { DocumentsRequest, DocumentsUploadResponse } from '@api/document';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { DocumentState } from "../store/models/document";

const getLoginToken = () => {
  return AsyncStorage.getItem('token')
}

const isLoggedIn = async () => {
  return !!(await getLoginToken())
}

const ORIGIN = Constants.manifest?.extra?.ORIGIN
if (!ORIGIN) {
  throw new Error('ORIGIN is not defined.')
}

const apiPort = Number(Constants.manifest?.extra?.apiPort)
if (!apiPort) {
  throw new Error('API_PORT is not defined.')
}

export const askServerUpdate = async (documentState: DocumentState): Promise<DocumentsUploadResponse | null> => {
  if (await isLoggedIn()) {
    try {
      const response = await upload(documentState)
      return response
    } catch (err) {
      console.error(err)
      return null
    }
  } else {
    return null
  }
}

const upload = async (documentState: DocumentState): Promise<DocumentsUploadResponse> => {
  const requestBody: DocumentsRequest = {
    updated: documentState.documentList.filter(({isUploaded}) => !isUploaded).map(({isUploaded, ...rest}) => rest),
    latestUpdatedDocumentFromDBAt: documentState.latestUpdatedDocumentFromDBAt
  }
  // TODO: Make this https
  const response = await axios.post<DocumentsUploadResponse>(`http://${ORIGIN}:${apiPort}/api/documents`, requestBody)
  return response.data
}
