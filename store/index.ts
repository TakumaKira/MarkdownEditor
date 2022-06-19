import { configureStore } from '@reduxjs/toolkit'
import { CurriedGetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware'
import { asyncStorageMiddleware } from './middlewares/asyncStorage'
import documentReducer, { DocumentState } from './slices/document'
import themeReducer, { ThemeState } from './slices/theme'

export type RootState = {
  document: DocumentState
  theme: ThemeState
}
export const reducer = {
  document: documentReducer,
  theme: themeReducer,
}
export const middleware = (gDM: CurriedGetDefaultMiddleware<RootState>) => gDM().concat(asyncStorageMiddleware)
const store = configureStore({
  reducer,
  middleware,
})
export default store

export type AppDispatch = typeof store.dispatch
