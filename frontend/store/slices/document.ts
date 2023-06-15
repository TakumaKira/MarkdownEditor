import { Document, DocumentsUpdateResponse } from '@api/document'
import { AsyncThunk, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import env from '../../env'
import { sortDocumentsFromNewest } from '../../helpers/sortDocuments'
import { ApiError, upload } from '../../services/api'
import { getData } from '../../services/asyncStorage'
import { DocumentOnDevice, DocumentOnEdit, DocumentState } from '../models/document'
import { WS_HANDSHAKE_TOKEN_KEY } from '../../constants'
import DocumentConfirmationStateTypes from '../../types/DocumentConfirmationStateTypes'

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

export const restoreDocument = createAsyncThunk(
  'document/restoreDocument',
  async () => {
    return await getData('document')
  }
)

export const SESSION_UNAUTHORIZED_ERROR = 'SESSION_UNAUTHORIZED_ERROR'
export const askServerUpdate = createAsyncThunk(
  'document/askServerUpdate',
  async ({documentState, isFirstAfterLogin}: {documentState: DocumentState, isFirstAfterLogin?: boolean}, {rejectWithValue}) => {
    try {
      const response = await upload(documentState)
      return { response: response.data, wsHandshakeToken: response.headers[WS_HANDSHAKE_TOKEN_KEY] as string, isFirstAfterLogin }
    } catch (err: any) {
      if ((err as ApiError).originalError.response?.status === 401) {
        return rejectWithValue(SESSION_UNAUTHORIZED_ERROR)
      }
      return Promise.reject(err)
    }
  }
) as AsyncThunk<{response: DocumentsUpdateResponse, wsHandshakeToken: string, isFirstAfterLogin: boolean | undefined}, {documentState: DocumentState, isFirstAfterLogin?: boolean}, {rejectValue: typeof SESSION_UNAUTHORIZED_ERROR}>

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
      const selectedDocumentId = state.documentOnEdit.id
      if (selectedDocumentId === null) {
        // documentOnEdit is from input params and not saved.
        const sorted = sortDocumentsFromNewest(state.documentList).filter(({isDeleted}) => !isDeleted)
        const latestDocument = sorted[0] || generateNewDocument()
        state.documentOnEdit.id = latestDocument.id
        state.documentOnEdit.titleInput = latestDocument.name ?? ''
        state.documentOnEdit.mainInput = latestDocument.content ?? ''
      } else {
        const notDeletedDocuments = state.documentList.filter(({isDeleted}) => !isDeleted)
        if (notDeletedDocuments.length === 0) {
          console.error(new Error('Document list should have at least one not-deleted document.'))
        } else if (
          notDeletedDocuments.length === 1
          && notDeletedDocuments[0].name === env.NEW_DOCUMENT_TITLE
          && notDeletedDocuments[0].content === ''
        ) {
          // Nothing to delete.
          // Reset to default input in case it has some input.
          state.documentOnEdit.titleInput = env.NEW_DOCUMENT_TITLE
          state.documentOnEdit.mainInput = ''
        } else {
          if (notDeletedDocuments.length <= 1) {
            const nextSelectedDocument = generateNewDocument()
            state.documentList.push(nextSelectedDocument)
            state.documentOnEdit.id = nextSelectedDocument.id
            state.documentOnEdit.titleInput = nextSelectedDocument.name ?? ''
            state.documentOnEdit.mainInput = nextSelectedDocument.content ?? ''
          } else {
            const sorted = sortDocumentsFromNewest(notDeletedDocuments)
            const selectedDocumentIndex = sorted.findIndex(({id}) => id === selectedDocumentId)
            const nextSelectedDocumentIndex = selectedDocumentIndex === 0 ? selectedDocumentIndex + 1 : selectedDocumentIndex - 1
            const nextSelectedDocument = sorted[nextSelectedDocumentIndex]
            state.documentOnEdit.id = nextSelectedDocument.id
            state.documentOnEdit.titleInput = nextSelectedDocument.name ?? ''
            state.documentOnEdit.mainInput = nextSelectedDocument.content ?? ''
          }
          const toBeDeletedDocument = state.documentList.find(({id}) => id === selectedDocumentId)
          if (toBeDeletedDocument) {
            toBeDeletedDocument.name = null
            toBeDeletedDocument.content = null
            toBeDeletedDocument.updatedAt = new Date().toISOString()
            toBeDeletedDocument.isDeleted = true
            toBeDeletedDocument.isUploaded = false
          }
        }
      }
    },
    /** Used only for right after loaded and any document not selected yet despite of not loaded from url params. */
    selectLatestDocument: state => {
      const sorted = sortDocumentsFromNewest(state.documentList).filter(({isDeleted}) => !isDeleted)
      const latestDocument = sorted[0] as DocumentOnDevice | undefined // Should not generate new document here.
      state.documentOnEdit.id = latestDocument?.id ?? null
      state.documentOnEdit.titleInput = latestDocument?.name ?? ''
      state.documentOnEdit.mainInput = latestDocument?.content ?? ''
    },
    acceptServerResponse: (state, action: PayloadAction<DocumentsUpdateResponse>) => {
      const response = action.payload

      // If id of the document on edit is listed on updatedIdsAsUnavailable,
      if (response.updatedIdsAsUnavailable.some(({from}) => from === state.documentOnEdit.id)) {
        // the selected id should be updated.
        state.documentOnEdit.id = response.updatedIdsAsUnavailable.find(({from}) => from === state.documentOnEdit.id)?.to!

      // If id of the document on edit is saved and listed on duplicatedIdsAsConflicted,
      } else if (
        !selectSelectedDocumentHasEdit({document: state})
        && response.duplicatedIdsAsConflicted.some(({original}) => original === state.documentOnEdit.id)
      ) {
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
        (
          selectSelectedDocumentHasEdit({document: state})
          && response.duplicatedIdsAsConflicted.some(({original}) => original === state.documentOnEdit.id)
        )
        // If the document on edit has unsaved changes and the saved version also is different from the one from database,
        || (selectSelectedDocumentHasEdit({document: state})
          && (
            state.documentList.find(({id}) => id === state.documentOnEdit.id)
            && response.allDocuments.find(({id}) => id === state.documentOnEdit.id)
            && !isEqual(
              state.documentList.find(({id}) => id === state.documentOnEdit.id)!,
              response.allDocuments.find(({id}) => id === state.documentOnEdit.id)!
            )
          )
        )
      ) {
        // it should be duplicated as conflict.
        const newDocument = generateNewDocument()
        newDocument.name = `[Conflicted]: ${state.documentOnEdit.titleInput}`
        newDocument.content = state.documentOnEdit.mainInput
        state.documentList.push(newDocument)
        state.documentOnEdit.id = newDocument.id
        state.confirmationState = {type: DocumentConfirmationStateTypes.UNSAVED_DOCUMENT_CONFLICTED}
      }

      // Replace all the documents.
      state.documentList = [...response.allDocuments.map(document => ({...document, isUploaded: true}))]

      // Set new lastSyncWithDBAt value.
      state.lastSyncWithDBAt = response.savedOnDBAt

      state.isAskingUpdate = false

      function isEqual(documentOnDevice: DocumentOnDevice, documentFromDB: Document): boolean {
        return documentOnDevice.id === documentFromDB.id
          && documentOnDevice.name === documentFromDB.name
          && documentOnDevice.content === documentFromDB.content
          && documentOnDevice.updatedAt === documentFromDB.updatedAt
      }
    },
    documentConfirmationStateChanged: (state, action: PayloadAction<DocumentState['confirmationState']>) => {
      state.confirmationState = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(restoreDocument.fulfilled, (state, action) => {
      const restored = action.payload
      if (restored) {
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
  documentConfirmationStateChanged,
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
