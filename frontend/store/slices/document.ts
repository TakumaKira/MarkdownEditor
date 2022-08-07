import { DocumentsUploadResponse } from '@api/document'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Constants from 'expo-constants'
import { v4 as uuidv4 } from 'uuid'
import { sortDocumentsFromNewest } from '../../helpers/sortDocuments'
import { Document, DocumentState } from '../models/document'

const generateNewDocument = (): Document => ({
  id: uuidv4(),
  name: Constants.manifest?.extra?.NEW_DOCUMENT_TITLE,
  content: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
  isUploaded: false
})

const initialState: DocumentState = {
  documentList: [],
  selectedDocumentId: null,
  latestUpdatedDocumentFromDBAt: null
}

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    addDocuments: (state, action: PayloadAction<{name: string, content: string}[]>) => {
      action.payload.forEach(({name, content}) => {
        const newDocument = generateNewDocument()
        newDocument.name = name
        newDocument.content = content
        state.documentList.push(newDocument)
      })
    },
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
        state.documentList[selectedDocumentIndex].updatedAt = new Date().toISOString()
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
    /** This reducer cannot be AsyncThunk as it has to dispatch acceptServerResponse using next inside middleware after askServerUpdate(async func). */
    restore: (state, action: PayloadAction<DocumentState | null>) => {
      const restored = action.payload
      if (restored) {
        state.documentList = restored.documentList
        state.selectedDocumentId = restored.selectedDocumentId
      }
    },
    acceptServerResponse: (state, action: PayloadAction<DocumentsUploadResponse | null>) => {
      const response = action.payload
      if (!response) {
        return
      }

      let latestUpdatedDocumentFromDBAt: string | null = null

      // Uploaded documents are successfully updated.
      response.uploadedDocumentsId.forEach(id => {
        const uploaded = state.documentList.find(({id: d}) => d === id)
        if (uploaded) {
          uploaded.isUploaded = true
          if (latestUpdatedDocumentFromDBAt === null || uploaded.updatedAt > latestUpdatedDocumentFromDBAt) {
            latestUpdatedDocumentFromDBAt = uploaded.updatedAt
          }
        } else {
          console.error(`Server returned uploaded document id ${id}, but there's no document with that id.`)
        }
      })

      // Update local with downloaded documents.
      response.fromDB.forEach(fromDB => {
        const localIndex = state.documentList.findIndex(({id}) => fromDB.id === id)
        if (localIndex === -1) {
          state.documentList.push({...fromDB, isUploaded: true})
        } else {
          state.documentList[localIndex] = {...fromDB, isUploaded: true}
        }
        if (latestUpdatedDocumentFromDBAt === null || fromDB.updatedAt > latestUpdatedDocumentFromDBAt) {
          latestUpdatedDocumentFromDBAt = fromDB.updatedAt
        }
      })

      // Update latestUpdatedDocumentFromDBAt.
      state.latestUpdatedDocumentFromDBAt = latestUpdatedDocumentFromDBAt
    }
  },
})

export const {
  addDocuments,
  newDocument,
  selectDocument,
  deselectDocument,
  saveDocument,
  deleteSelectedDocument,
  selectLatestDocument,
  restore,
  acceptServerResponse,
} = documentSlice.actions

export const selectSelectedDocument = (state: {document: DocumentState}): Document | null =>
  state.document.documentList.find(({id}) => id === state.document.selectedDocumentId) ?? null

export default documentSlice.reducer
