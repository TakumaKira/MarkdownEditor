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
    lastSyncWithDBAt: null,
    confirmationState: null,
    restoreFromAsyncStorageIsDone: true,
    isAskingUpdate: false,
  },
  theme: {
    deviceColorSchemeIsDark: false,
    selectedColorSchemeIsDark: false,
    restoreIsDone: true,
  },
  user: {
    email: null,
    wsHandshakeToken: null,
    authState: null,
    confirmationState: null,
    restoreIsDone: true,
    firstSyncIsDone: false,
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
    lastSyncWithDBAt: null,
    confirmationState: null,
    restoreFromAsyncStorageIsDone: true,
    isAskingUpdate: false,
  },
  theme: {
    deviceColorSchemeIsDark: true, // This will be reset on initialization.
    selectedColorSchemeIsDark: true,
    restoreIsDone: true,
  },
  user: {
    email: null,
    wsHandshakeToken: null,
    authState: null,
    confirmationState: null,
    restoreIsDone: true,
    firstSyncIsDone: false,
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
