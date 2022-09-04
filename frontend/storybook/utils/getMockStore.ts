import { configureStore, EnhancedStore } from "@reduxjs/toolkit"
import { CurriedGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware"
import { ConfirmationState } from "../../constants/confirmationMessages"
import { reducer, RootState } from "../../store"

const defaultPreloadedState: RootState = {
  document: {
    documentList: [],
    documentOnEdit: {
      id: null,
      titleInput: '',
      mainInput: '',
    },
    latestUpdatedDocumentFromDBAt: null,
    confirmationState: {
      state: ConfirmationState.NONE,
    },
  },
  theme: {
    deviceColorSchemeIsDark: false,
    selectedColorSchemeIsDark: false,
  },
  user: {
    token: null,
    email: null,
  },
  initializationIsDone: true,
}
export const preloadedStateInDarkScheme: RootState = {
  document: {
    documentList: [],
    documentOnEdit: {
      id: null,
      titleInput: '',
      mainInput: '',
    },
    latestUpdatedDocumentFromDBAt: null,
    confirmationState: {
      state: ConfirmationState.NONE,
    },
  },
  theme: {
    deviceColorSchemeIsDark: true, // This will be reset on initialization.
    selectedColorSchemeIsDark: true,
  },
  user: {
    token: null,
    email: null,
  },
  initializationIsDone: true,
}
const getMockStore = (preloadedState = defaultPreloadedState): EnhancedStore => {
  return configureStore({
    reducer,
    middleware: (gDM: CurriedGetDefaultMiddleware<RootState>) => gDM(),
    preloadedState,
  })
}
export default getMockStore
