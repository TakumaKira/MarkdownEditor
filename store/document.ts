import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Constants from 'expo-constants'
import { v4 as uuidv4 } from 'uuid'
import { mockInitialDocuments } from './mockInitialData'

export interface Document {
  createdAt: string
  lastUpdatedAt: string
  name: string
  content: string
  id: string
}
interface DocumentState {
  documentList: Document[]
  selectedDocumentId: string | null
}
const initialState: DocumentState = {
  documentList: mockInitialDocuments,
  selectedDocumentId: null
}

const generateNewDocument = (): Document => ({
  createdAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
  name: Constants.manifest?.extra?.NEW_DOCUMENT_TITLE,
  content: '',
  id: uuidv4(),
})

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    newDocument: state => {
      const newDocument = generateNewDocument()
      state.documentList.push(newDocument)
      state.selectedDocumentId = newDocument.id
    },
    selectDocument: (state, action: PayloadAction<string>) => {
      state.selectedDocumentId = action.payload
    },
    saveDocument: (state, action: PayloadAction<{titleInput: string, mainInput: string}>) => {
      if (!state.selectedDocumentId) {
        const newDocument = generateNewDocument()
        state.documentList.push(newDocument)
        state.selectedDocumentId = newDocument.id
      }
      const selectedDocumentIndex = state.documentList.findIndex(({id}) => id === state.selectedDocumentId)
      if (selectedDocumentIndex !== -1) {
        state.documentList[selectedDocumentIndex].name = action.payload.titleInput
        state.documentList[selectedDocumentIndex].content = action.payload.mainInput
        state.documentList[selectedDocumentIndex].lastUpdatedAt = new Date().toISOString()
      }
    }
  }
})

export const {
  newDocument,
  selectDocument,
  saveDocument,
} = documentSlice.actions

export const selectSelectedDocument = (state: {document: DocumentState}): Document | null =>
  state.document.documentList.find(({id}) => id === state.document.selectedDocumentId) ?? null

export default documentSlice.reducer
