import { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { storeData } from "../../services/asyncStorage";
import { DocumentState } from "../models/document";
import { deleteSelectedDocument, newDocument, restore, saveDocument, selectDocument, selectLatestDocument } from "../slices/document";
import { toggleTheme } from "../slices/theme";

export const asyncStorageMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === selectDocument.type
    // || action.type === deselectDocument.type // Avoid storing selecting null id
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
    || action.type === selectLatestDocument.type
    || (action.type === restore.type && (action as PayloadAction<DocumentState | null>).payload === null)
  ) {
    storeData('document', store.getState().document)
  }

  if (
    action.type === toggleTheme.type
  ) {
    storeData('theme', store.getState().theme)
  }
}
