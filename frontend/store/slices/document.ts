import { Document, DocumentsUpdateResponse } from '@api/document'
import { AsyncThunk, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import env from '../../env'
import { ConfirmationStateTypes } from '../../constants/confirmationMessages'
import { sortDocumentsFromNewest } from '../../helpers/sortDocuments'
import { upload } from '../../services/api'
import { getData } from '../../services/asyncStorage'
import { DocumentOnDevice, DocumentOnEdit, DocumentState } from '../models/document'

const generateNewDocument = (): DocumentOnDevice => ({
  id: uuidv4(),
  name: env.NEW_DOCUMENT_TITLE,
  content: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  savedOnDBAt: null,
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
  lastSyncWithDBAt: null,
  confirmationState: null,
  restoreFromAsyncStorageIsDone: false,
  isAskingUpdate: false,
}

export const restoreDocument = createAsyncThunk('document/restoreDocument', () => {
  return getData('document')
})

export const askServerUpdate: AsyncThunk<DocumentsUpdateResponse | null, DocumentState, {}> = createAsyncThunk('document/askServerUpdate', (documentState: DocumentState) => {
  try {
    return upload(documentState)
  } catch (err) {
    console.error(err)
    return null
  }
})

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
      state.documentList.push(...action.payload.map(({name, content}) => {
        const newDocument = generateNewDocument()
        newDocument.name = name
        newDocument.content = content
        return newDocument
      }))
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
        state.documentOnEdit.id = newDocument.id
        newDocument.name = state.documentOnEdit.titleInput
        newDocument.content = state.documentOnEdit.mainInput
        state.documentList.push(newDocument)
      } else {
        const selectedDocument = state.documentList.find(({id}) => id === state.documentOnEdit.id)
        if (selectedDocument) {
          selectedDocument.name = state.documentOnEdit.titleInput
          selectedDocument.content = state.documentOnEdit.mainInput
          selectedDocument.updatedAt = new Date().toISOString()
          selectedDocument.isUploaded = false
        }
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
    acceptServerResponse: (state, action: PayloadAction<DocumentsUpdateResponse>) => {
      const response = action.payload

      // TODO: Refactor and check if work below.

      // If id of the document on edit is listed on updatedIdsAsUnavailable,
      if (response.updatedIdsAsUnavailable.some(({from}) => from === state.documentOnEdit.id)) {
        // the selected id should be updated.
        state.documentOnEdit.id = response.updatedIdsAsUnavailable.find(({from}) => from === state.documentOnEdit.id)?.to!

      // If id of the document on edit is saved and listed on duplicatedIdsAsConflicted,
      } else if (!selectSelectedDocumentHasEdit({document: state}) && response.duplicatedIdsAsConflicted.some(({original}) => original === state.documentOnEdit.id)) {
        // selected document should be switched to the duplicated one.
        const duplicatedDocumentId = response.duplicatedIdsAsConflicted.find(({original}) => original === state.documentOnEdit.id)?.duplicated!
        const duplicatedDocument = response.allDocuments.find(({id}) => id === duplicatedDocumentId)!
        state.documentOnEdit = {
          id: duplicatedDocumentId,
          titleInput: duplicatedDocument.name ?? '',
          mainInput: duplicatedDocument.content ?? '',
        }
      } else if (
        // If id of the document on edit is unsaved and listed on duplicatedIdsAsConflicted,
        (selectSelectedDocumentHasEdit({document: state}) && response.duplicatedIdsAsConflicted.some(({original}) => original === state.documentOnEdit.id))
        // If the document on edit has unsaved changes and the saved version also is different from the one from database,
        || (selectSelectedDocumentHasEdit({document: state})
          && (
            state.documentList.find(({id}) => id === state.documentOnEdit.id)
            && response.allDocuments.find(({id}) => id === state.documentOnEdit.id)
            && !isEqual(state.documentList.find(({id}) => id === state.documentOnEdit.id)!, response.allDocuments.find(({id}) => id === state.documentOnEdit.id)!))
          )
      ) {
        // it should be duplicated as conflict.
        const newDocument = generateNewDocument()
        newDocument.name = `[Conflicted]: ${state.documentOnEdit.titleInput}`
        newDocument.content = state.documentOnEdit.mainInput
        state.documentList.push(newDocument)
        state.documentOnEdit.id = newDocument.id
        state.confirmationState = {type: ConfirmationStateTypes.UNSAVED_DOCUMENT_CONFLICTED}
      }

      // Replace all the documents.
      state.documentList = [...response.allDocuments.map(document => ({...document, isUploaded: true}))]

      // Set new lastSyncWithDBAt value.
      state.lastSyncWithDBAt = response.savedOnDBAt
    },
    confirmationStateChanged: (state, action: PayloadAction<DocumentState['confirmationState']>) => {
      state.confirmationState = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(restoreDocument.fulfilled, (state, action) => {
      const restored = action.payload
      if (restored) {
        // TODO: Test automatically check to not miss restoring any property.
        state.documentList = restored.documentList
        state.documentOnEdit.id = restored.documentOnEdit.id
        const selectedDocumentOnList = selectSelectedDocumentOnList({document: state})
        if (selectedDocumentOnList) {
          state.documentOnEdit.titleInput = selectedDocumentOnList.name ?? ''
          state.documentOnEdit.mainInput = selectedDocumentOnList.content ?? ''
        }
        state.lastSyncWithDBAt = restored.lastSyncWithDBAt
      } else {
        const initialDocuments: {name: string, content: string}[] = env.INITIAL_DOCUMENTS
        state.documentList.push(...initialDocuments.map(({name, content}) => {
          const newDocument = generateNewDocument()
          newDocument.name = name
          newDocument.content = content
          return newDocument
        }))
        const {id, name, content} = state.documentList[0]
        state.documentOnEdit = {
          id,
          titleInput: name ?? '',
          mainInput: content ?? '',
        }
      }
      state.restoreFromAsyncStorageIsDone = true
    })
    builder.addCase(askServerUpdate.pending, (state, action) => {
      state.isAskingUpdate = true
    })
    builder.addCase(askServerUpdate.fulfilled, (state, action) => {
      state.isAskingUpdate = false
    })
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

// TODO: Refactor and check if work below.
function isEqual(documentOnDevice: DocumentOnDevice, documentFromDB: Document): boolean {
  return documentOnDevice.id === documentFromDB.id
    && documentOnDevice.name === documentFromDB.name
    && documentOnDevice.content === documentFromDB.content
    && documentOnDevice.updatedAt === documentFromDB.updatedAt
}
