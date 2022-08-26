import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "..";
import { askServerUpdate } from "../../services/api";
import { deleteSelectedDocument, newDocument, restoreDocument, saveDocument } from "../slices/document";

export const apiMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
    || action.type === restoreDocument.type
  ) {
    const state = store.getState()
    const isLoggedIn = !!state.user.token
    if (isLoggedIn) {
      askServerUpdate(state.document, next)
    }
  }
}
