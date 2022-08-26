import { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { filterDocumentStateToRestore, filterThemeStateToRestore, filterUserStateToRestore, storeData } from "../../services/asyncStorage";
import { DocumentState } from "../models/document";
import { ThemeState } from "../models/theme";
import { UserState } from "../models/user";
import { addDocuments, deleteSelectedDocument, newDocument, restoreDocument, saveDocument, selectDocument, selectLatestDocument } from "../slices/document";
import { restoreTheme, toggleTheme } from "../slices/theme";
import { login, logout, restoreUser } from "../slices/user";

export const asyncStorageMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === login.type
    || action.type === logout.type
    || action.type === restoreUser.type && (action as PayloadAction<UserState | null>).payload === null
  ) {
    storeData('user', filterUserStateToRestore(store.getState().user))
  }

  if (
    action.type === addDocuments.type
    || action.type === newDocument.type
    || action.type === selectDocument.type
    // || action.type === deselectDocument.type // Avoid storing selecting null id
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
    || action.type === selectLatestDocument.type
    || (action.type === restoreDocument.type && (action as PayloadAction<DocumentState | null>).payload === null)
  ) {
    storeData('document', filterDocumentStateToRestore(store.getState().document))
  }

  if (
    action.type === toggleTheme.type
    || action.type === restoreTheme.type && (action as PayloadAction<ThemeState | null>).payload === null
  ) {
    storeData('theme', filterThemeStateToRestore(store.getState().theme))
  }
}
