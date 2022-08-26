import { DocumentsUploadResponse } from '@api/document'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Constants from 'expo-constants'
import { v4 as uuidv4 } from 'uuid'
import { ConfirmationState } from '../../constants/confirmationMessages'
import { sortDocumentsFromNewest } from '../../helpers/sortDocuments'
import { ConfirmationStateProps, DocumentOnDevice, DocumentOnEdit, DocumentState, DocumentStateRestore } from '../models/document'

const generateNewDocument = (): DocumentOnDevice => ({
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
  documentOnEdit: {
    id: null,
    titleInput: '',
    mainInput: ''
  },
  latestUpdatedDocumentFromDBAt: null,
  confirmationState: {
    state: ConfirmationState.NONE
  }
}

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    updateTitleInput: (state, action: PayloadAction<string>) => {
      state.documentOnEdit.titleInput = action.payload
    },
    updateMainInput: (state, action: PayloadAction<string>) => {
      state.documentOnEdit.mainInput = action.payload
    },
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
      state.documentOnEdit.id = newDocument.id
      state.documentOnEdit.titleInput = newDocument.name ?? ''
      state.documentOnEdit.mainInput = newDocument.content ?? ''
  },
    selectDocument: (state, action: PayloadAction<string>) => {
      state.documentOnEdit.id = action.payload
      const selectedDocumentOnList = selectSelectedDocumentOnList({document: state})
      if (selectedDocumentOnList) {
        state.documentOnEdit.titleInput = selectedDocumentOnList.name ?? ''
        state.documentOnEdit.mainInput = selectedDocumentOnList.content ?? ''
      }
    },
    /** Used only for load input from url params */
    deselectDocument: state => {
      state.documentOnEdit.id = null
    },
    saveDocument: state => {
      if (!state.documentOnEdit.id) {
        const newDocument = generateNewDocument()
        state.documentList.push(newDocument)
        state.documentOnEdit.id = newDocument.id
        state.documentOnEdit.titleInput = newDocument.name ?? ''
        state.documentOnEdit.mainInput = newDocument.content ?? ''
        }
      const selectedDocumentIndex = state.documentList.findIndex(({id}) => id === state.documentOnEdit.id)
      if (selectedDocumentIndex !== -1) {
        state.documentList[selectedDocumentIndex].name = state.documentOnEdit.titleInput
        state.documentList[selectedDocumentIndex].content = state.documentOnEdit.mainInput
        state.documentList[selectedDocumentIndex].updatedAt = new Date().toISOString()
        state.documentList[selectedDocumentIndex].isUploaded = false
      }
    },
    deleteSelectedDocument: state => {
      const sorted = sortDocumentsFromNewest(state.documentList)
      const selectedDocumentIndex = sorted.findIndex(({id}) => id === state.documentOnEdit.id)
      const nextSelectedDocumentIndex = selectedDocumentIndex === sorted.length - 1 ? selectedDocumentIndex - 1 : selectedDocumentIndex + 1
      const nextSelectedDocument = sorted[nextSelectedDocumentIndex]
      const deletedDocument = state.documentList.find(({id}) => id === state.documentOnEdit.id)
      if (deletedDocument) {
        deletedDocument.name = null
        deletedDocument.content = null
        deletedDocument.createdAt = null
        deletedDocument.updatedAt = new Date().toISOString()
        deletedDocument.isDeleted = true
        deletedDocument.isUploaded = false
      }
      state.documentOnEdit.id = nextSelectedDocument.id
      state.documentOnEdit.titleInput = nextSelectedDocument.name ?? ''
      state.documentOnEdit.mainInput = nextSelectedDocument.content ?? ''
    },
    /** Used only for right after loaded and any document not selected yet despite of not loaded from url params. */
    selectLatestDocument: state => {
      const sorted = sortDocumentsFromNewest(state.documentList)
      const latestDocument = sorted[0] as DocumentOnDevice | undefined
      state.documentOnEdit.id = latestDocument?.id ?? null
      state.documentOnEdit.titleInput = latestDocument?.name ?? ''
      state.documentOnEdit.mainInput = latestDocument?.content ?? ''
    },
    /** This reducer cannot be AsyncThunk as it has to dispatch acceptServerResponse using next inside middleware after askServerUpdate(async func). */
    restoreDocument: (state, action: PayloadAction<DocumentStateRestore | null>) => {
      const restored = action.payload
      if (restored) {
        try {
          // TODO: Test automatically check to not miss restoring any property.
          state.documentList = restored.documentList
          state.documentOnEdit.id = restored.documentOnEdit.id
          state.latestUpdatedDocumentFromDBAt = restored.latestUpdatedDocumentFromDBAt
        } catch (err) {
          console.error(err)
        }
      }
    },
    acceptServerResponse: (state, action: PayloadAction<DocumentsUploadResponse>) => {
      const response = action.payload

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
          if (fromDB.id === state.documentOnEdit.id && selectSelectedDocumentHasEdit({document: state})) {
            state.documentOnEdit.titleInput = `[Conflicted]: ${state.documentOnEdit.titleInput}`
            const newDocument = generateNewDocument()
            newDocument.name = state.documentOnEdit.titleInput
            newDocument.content = state.documentOnEdit.mainInput
            state.documentList.push(newDocument)
            state.documentOnEdit.id = newDocument.id
            state.confirmationState = {state: ConfirmationState.UNSAVED_DOCUMENT_CONFLICTED}
            // TODO: Upload conflicted document.
          }
          state.documentList[localIndex] = {...fromDB, isUploaded: true}
        }
        if (latestUpdatedDocumentFromDBAt === null || fromDB.updatedAt > latestUpdatedDocumentFromDBAt) {
          latestUpdatedDocumentFromDBAt = fromDB.updatedAt
        }
      })

      // No need to store deleted and uploaded documents.
      state.documentList = state.documentList.filter(({isDeleted, isUploaded}) => !isDeleted || !isUploaded)

      // Update latestUpdatedDocumentFromDBAt.
      if (latestUpdatedDocumentFromDBAt) {
        state.latestUpdatedDocumentFromDBAt = latestUpdatedDocumentFromDBAt
      }
    },
    confirmationStateChanged: (state, action: PayloadAction<ConfirmationStateProps>) => {
      state.confirmationState = action.payload
    },
  },
})

export const {
  updateTitleInput,
  updateMainInput,
  addDocuments,
  newDocument,
  selectDocument,
  deselectDocument,
  saveDocument,
  deleteSelectedDocument,
  selectLatestDocument,
  restoreDocument,
  acceptServerResponse,
  confirmationStateChanged,
} = documentSlice.actions

export const selectSelectedDocumentOnList = (state: {document: DocumentState}): DocumentOnDevice | null =>
  state.document.documentList.find(({id}) => id === state.document.documentOnEdit.id) ?? null

export const selectSelectedDocumentOnEdit = (state: {document: DocumentState}): DocumentOnEdit =>
  state.document.documentOnEdit

export const selectSelectedDocumentHasEdit = (state: {document: DocumentState}): boolean => {
  const selectedDocumentOnList = selectSelectedDocumentOnList(state)
  const {titleInput, mainInput} = selectSelectedDocumentOnEdit(state)
  return (selectedDocumentOnList === null && (titleInput !== '' || mainInput !== ''))
    || (selectedDocumentOnList !== null && (titleInput !== selectedDocumentOnList.name || mainInput !== selectedDocumentOnList.content))
}

export const selectLiveDocumentList = (state: {document: DocumentState}): DocumentOnDevice[] =>
  state.document.documentList.filter(({isDeleted}) => !isDeleted)

export default documentSlice.reducer
