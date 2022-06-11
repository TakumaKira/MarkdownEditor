import { configureStore } from '@reduxjs/toolkit'
import documentReducer, { DocumentState } from './slices/document'
import { asyncStorageMiddleware } from './middlewares/asyncStorage'

export type RootState = {
  document: DocumentState;
}
const store = configureStore({
  reducer: {
    document: documentReducer,
  },
  middleware: gDM => gDM().concat(asyncStorageMiddleware)
})
export default store

export type AppDispatch = typeof store.dispatch
