import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { acceptServerResponse, askServerUpdate, deleteSelectedDocument, newDocument, restoreDocument, saveDocument, selectLatestDocument } from "../slices/document";

export const apiMiddleware: ThunkMiddleware<RootState, AnyAction> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
  ) {
    const state = store.getState()
    const isLoggedIn = !!state.user.token
    if (isLoggedIn) {
      store.dispatch(askServerUpdate(state.document))
    }
  }

  if (
    action.type === askServerUpdate.fulfilled.type
  ) {
    const { payload } = action as ReturnType<typeof askServerUpdate.fulfilled>
    if (payload) {
      store.dispatch(acceptServerResponse(payload))
    }
  }

  if (
    action.type === acceptServerResponse.type
    && store.getState().document.documentOnEdit.id === null
  ) {
    store.dispatch(selectLatestDocument())
  }
}
