import { configureStore } from '@reduxjs/toolkit'
import { CurriedGetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware'
import { apiMiddleware } from './middlewares/api'
import { asyncStorageMiddleware } from './middlewares/asyncStorage'
import { DocumentState } from './models/document'
import { ThemeState } from './models/theme'
import documentReducer from './slices/document'
import themeReducer from './slices/theme'

export type RootState = {
  document: DocumentState
  theme: ThemeState
}
export const reducer = {
  document: documentReducer,
  theme: themeReducer,
}
export const middleware = (gDM: CurriedGetDefaultMiddleware<RootState>) =>
  gDM()
    .concat(asyncStorageMiddleware)
    .concat(apiMiddleware)
const store = configureStore({
  reducer,
  middleware,
})
export default store

export type AppDispatch = typeof store.dispatch
