import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "..";
import { storeData } from "../../helpers/asyncStorage";
import { deleteSelectedDocument, newDocument, saveDocument, selectDocument, selectLatestDocument } from "../slices/document";

export const asyncStorageMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === selectDocument.type
    // || action.type === deselectDocument.type // Avoid storing selecting null id
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
    || action.type === selectLatestDocument.type
  ) {
    storeData(store.getState())
  }
}
