import { configureStore, EnhancedStore } from "@reduxjs/toolkit"
import { CurriedGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware"
import { reducer, RootState } from "../../store"
import { authMiddleware } from "../../store/middlewares/auth"

const defaultPreloadedState: RootState = {
  document: {
    documentList: [],
    documentOnEdit: {
      id: null,
      titleInput: '',
      mainInput: '',
    },
    latestUpdatedDocumentFromDBAt: null,
    confirmationState: null,
    restoreFromAsyncStorageIsDone: true,
  },
  theme: {
    deviceColorSchemeIsDark: false,
    selectedColorSchemeIsDark: false,
    restoreIsDone: true,
  },
  user: {
    token: null,
    email: null,
    authState: null,
    restoreIsDone: true,
  },
  storeInitializationIsDone: true,
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
    confirmationState: null,
    restoreFromAsyncStorageIsDone: true,
  },
  theme: {
    deviceColorSchemeIsDark: true, // This will be reset on initialization.
    selectedColorSchemeIsDark: true,
    restoreIsDone: true,
  },
  user: {
    token: null,
    email: null,
    authState: null,
    restoreIsDone: true,
  },
  storeInitializationIsDone: true,
}
const getMockStore = (preloadedState = defaultPreloadedState): EnhancedStore => {
  return configureStore({
    reducer,
    middleware: (gDM: CurriedGetDefaultMiddleware<RootState>) =>
      gDM()
        // .concat(storeInitializationDoneMiddleware)
        // .concat(prepareDefaultDocumentsMiddleware)
        // .concat(asyncStorageMiddleware)
        .concat(authMiddleware),
        // .concat(apiMiddleware),
    preloadedState,
  })
}
export default getMockStore
