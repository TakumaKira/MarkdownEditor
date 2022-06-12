import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import Constants from 'expo-constants'
import { v4 as uuidv4 } from 'uuid'
import { getData, storeData } from '../../helpers/asyncStorage'
import { sortDocumentsFromNewest } from '../../helpers/functions'

export interface Document {
  createdAt: string
  lastUpdatedAt: string
  name: string
  content: string
  id: string
}
export interface DocumentState {
  documentList: Document[]
  selectedDocumentId: string | null
}

const generateNewDocument = (): Document => ({
  createdAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
  name: Constants.manifest?.extra?.NEW_DOCUMENT_TITLE,
  content: '',
  id: uuidv4(),
})

const generateInitialDocuments = (): Document[] => {
  return Constants.manifest?.extra?.INITIAL_DOCUMENTS?.map((document: {name: string, content: string}) => {
    const newDocument = generateNewDocument()
    newDocument.name = document.name
    newDocument.content = document.content
    return newDocument
  })
}

const initialState: DocumentState = {
  documentList: [],
  selectedDocumentId: null
}

export const getDataFromAsyncStorage = createAsyncThunk(
  'document/getDataFromAsyncStorage',
  getData
)

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
    /** Used only for load input from url params */
    deselectDocument: state => {
      state.selectedDocumentId = null
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
    },
    deleteSelectedDocument: state => {
      const sorted = sortDocumentsFromNewest(state.documentList)
      const selectedDocumentIndex = sorted.findIndex(({id}) => id === state.selectedDocumentId)
      const nextSelectedDocumentIndex = selectedDocumentIndex === sorted.length - 1 ? selectedDocumentIndex - 1 : selectedDocumentIndex + 1
      const nextSelectedDocumentId = sorted[nextSelectedDocumentIndex].id
      const deletedDocumentId = state.selectedDocumentId
      state.selectedDocumentId = nextSelectedDocumentId
      state.documentList = state.documentList.filter(({id}) => id !== deletedDocumentId)
    },
    /** Used only for right after loaded and any document not selected yet despite of not loaded from url params */
    selectLatestDocument: state => {
      const sorted = sortDocumentsFromNewest(state.documentList)
      state.selectedDocumentId = sorted[0]?.id || null
    },
  },
  extraReducers: builder => {
    builder.addCase(getDataFromAsyncStorage.fulfilled, (state, action) => {
      const restored = action.payload
      if (restored) {
        state.documentList = restored.document.documentList
        state.selectedDocumentId = restored.document.selectedDocumentId
      } else {
        state.documentList = generateInitialDocuments()
        state.selectedDocumentId = state.documentList?.[0].id || null
        storeData({document: state})
      }
    })
  }
})

export const {
  newDocument,
  selectDocument,
  deselectDocument,
  saveDocument,
  deleteSelectedDocument,
  selectLatestDocument,
} = documentSlice.actions

export const selectSelectedDocument = (state: {document: DocumentState}): Document | null =>
  state.document.documentList.find(({id}) => id === state.document.selectedDocumentId) ?? null

export default documentSlice.reducer
