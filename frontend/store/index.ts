import { configureStore } from '@reduxjs/toolkit'
import { CurriedGetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware'
import { apiMiddleware } from './middlewares/api'
import { asyncStorageMiddleware } from './middlewares/asyncStorage'
import { prepareDefaultDocumentsMiddleware } from './middlewares/prepareDefaultDocuments'
import { DocumentState, DocumentStateRestore } from './models/document'
import { ThemeState, ThemeStateRestore } from './models/theme'
import { UserState, UserStateRestore } from './models/user'
import documentReducer from './slices/document'
import initializationIsDoneReducer from './slices/initializationIsDone'
import themeReducer from './slices/theme'
import userReducer from './slices/user'

export type RootState = {
  document: DocumentState
  theme: ThemeState
  user: UserState
  initializationIsDone: boolean
}
export type RootStateRestore = {
  document: DocumentStateRestore
  theme: ThemeStateRestore
  user: UserStateRestore
}
export const reducer = {
  document: documentReducer,
  theme: themeReducer,
  user: userReducer,
  initializationIsDone: initializationIsDoneReducer,
}
export const middleware = (gDM: CurriedGetDefaultMiddleware<RootState>) =>
  gDM()
    .concat(asyncStorageMiddleware)
    .concat(apiMiddleware)
    .concat(prepareDefaultDocumentsMiddleware)
const store = configureStore({
  reducer,
  middleware,
})
export default store

export type AppDispatch = typeof store.dispatch
