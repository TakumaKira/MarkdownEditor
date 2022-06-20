import { configureStore, EnhancedStore } from "@reduxjs/toolkit"
import { CurriedGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware"
import { reducer, RootState } from "../../store"

const defaultPreloadedState: RootState = {
  document: {
    documentList: [],
    selectedDocumentId: null,
  },
  theme: {
    deviceColorSchemeIsDark: false,
    selectedColorSchemeIsDark: false,
  },
}
export const preloadedStateInDarkScheme: RootState = {
  document: {
    documentList: [],
    selectedDocumentId: null,
  },
  theme: {
    deviceColorSchemeIsDark: true, // This will be reset on initialization.
    selectedColorSchemeIsDark: true,
  },
}
const getMockStore = (preloadedState = defaultPreloadedState): EnhancedStore => {
  return configureStore({
    reducer,
    middleware: (gDM: CurriedGetDefaultMiddleware<RootState>) => gDM(),
    preloadedState,
  })
}
export default getMockStore
