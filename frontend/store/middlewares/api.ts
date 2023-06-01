import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { acceptServerResponse, askServerUpdate, deleteSelectedDocument, newDocument, restoreDocument, saveDocument, selectLatestDocument } from "../slices/document";
import { updateWsHandshakeToken } from '../slices/user';

export const apiMiddleware: ThunkMiddleware<RootState, AnyAction> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
  ) {
    const state = store.getState()
    const isLoggedIn = !!state.user.email
    if (isLoggedIn) {
      store.dispatch(askServerUpdate(state.document))
    }
  }

  if (
    action.type === askServerUpdate.fulfilled.type
  ) {
    const { payload } = action as ReturnType<typeof askServerUpdate.fulfilled>
    if (payload) {
      store.dispatch(updateWsHandshakeToken({wsHandshakeToken: payload.wsHandshakeToken}))
      store.dispatch(acceptServerResponse(payload.response))
    }
  }

  if (
    action.type === acceptServerResponse.type
    && store.getState().document.documentOnEdit.id === null
  ) {
    store.dispatch(selectLatestDocument())
  }
}
