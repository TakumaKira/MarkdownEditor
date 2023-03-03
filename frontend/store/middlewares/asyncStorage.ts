import { AnyAction, PayloadAction } from "@reduxjs/toolkit";
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { filterDocumentStateToRestore, filterThemeStateToRestore, filterUserStateToRestore, storeData } from "../../services/asyncStorage";
import { DocumentState } from "../models/document";
import { ThemeState } from "../models/theme";
import { UserState } from "../models/user";
import { acceptServerResponse, addDocuments, deleteSelectedDocument, newDocument, restoreDocument, saveDocument, selectDocument, selectLatestDocument } from "../slices/document";
import { restoreTheme, toggleTheme } from "../slices/theme";
import { askServerLogin, removeLoginToken, restoreUser } from "../slices/user";

export const asyncStorageMiddleware: ThunkMiddleware<RootState, AnyAction> = store => next => action => {
  next(action)

  if (
    action.type === askServerLogin.fulfilled.type
    || action.type === removeLoginToken.type
    || action.type === restoreUser.fulfilled.type && (action as PayloadAction<UserState | null>).payload === null
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
    || (action.type === restoreDocument.fulfilled.type && (action as PayloadAction<DocumentState | null>).payload === null)
    || action.type === acceptServerResponse.type
  ) {
    storeData('document', filterDocumentStateToRestore(store.getState().document))
  }

  if (
    action.type === toggleTheme.type
    || action.type === restoreTheme.fulfilled.type && (action as PayloadAction<ThemeState | null>).payload === null
  ) {
    storeData('theme', filterThemeStateToRestore(store.getState().theme))
  }
}
