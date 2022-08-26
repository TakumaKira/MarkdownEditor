import { DocumentsRequest, DocumentsUploadResponse } from '@api/document';
import { Dispatch } from '@reduxjs/toolkit';
import axios from 'axios';
import Constants from 'expo-constants';
import { DocumentState } from "../store/models/document";
import { acceptServerResponse } from '../store/slices/document';

export const askServerUpdate = async (documentState: DocumentState, dispatch: Dispatch): Promise<void> => {
  try {
    const response = await upload(documentState)
    dispatch(acceptServerResponse(response))
  } catch (err) {
    console.error(err)
  }
}

const upload = async (documentState: DocumentState): Promise<DocumentsUploadResponse> => {
  const ORIGIN = Constants.manifest?.extra?.ORIGIN
  if (!ORIGIN) {
    throw new Error('ORIGIN is not defined.')
  }
  const API_PORT = Number(Constants.manifest?.extra?.API_PORT)
  if (!API_PORT) {
    throw new Error('API_PORT is not defined.')
  }

  const requestBody: DocumentsRequest = {
    updated: documentState.documentList.filter(({isUploaded}) => !isUploaded).map(({isUploaded, ...rest}) => rest),
    latestUpdatedDocumentFromDBAt: documentState.latestUpdatedDocumentFromDBAt
  }
  // TODO: Make this https
  const response = await axios.post<DocumentsUploadResponse>(`http://${ORIGIN}:${API_PORT}/api/documents`, requestBody)
  return response.data
}
