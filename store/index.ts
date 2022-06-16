import { configureStore } from '@reduxjs/toolkit'
import documentReducer, { DocumentState } from './slices/document'
import themeReducer, { ThemeState } from './slices/theme'
import { asyncStorageMiddleware } from './middlewares/asyncStorage'

export type RootState = {
  document: DocumentState
  theme: ThemeState
}
const store = configureStore({
  reducer: {
    document: documentReducer,
    theme: themeReducer,
  },
  middleware: gDM => gDM().concat(asyncStorageMiddleware)
})
export default store

export type AppDispatch = typeof store.dispatch
