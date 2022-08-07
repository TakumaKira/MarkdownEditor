import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "..";
import { askServerUpdate } from "../../services/api";
import { acceptServerResponse, deleteSelectedDocument, newDocument, restore, saveDocument } from "../slices/document";

export const apiMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
    || action.type === restore.type
  ) {
    const documentState = store.getState().document
    askServerUpdate(documentState)
      .then(response => response && next(acceptServerResponse(response)))
  }
}
