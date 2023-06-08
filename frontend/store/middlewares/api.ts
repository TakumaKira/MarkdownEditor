import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { acceptServerResponse, askServerUpdate, deleteSelectedDocument, newDocument, restoreDocument, saveDocument, selectLatestDocument } from "../slices/document";
import { firstSyncIsDone, updateWsHandshakeToken } from '../slices/user';

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
      store.dispatch(askServerUpdate({documentState: state.document}))
    }
  }

  if (
    action.type === askServerUpdate.fulfilled.type
  ) {
    const { payload } = action as ReturnType<typeof askServerUpdate.fulfilled>
    if (payload) {
      const {wsHandshakeToken, isFirstAfterLogin} = payload
      store.dispatch(updateWsHandshakeToken({wsHandshakeToken, isFirstAfterLogin}))
      store.dispatch(acceptServerResponse(payload.response))
    }
  }

  if (
    action.type === updateWsHandshakeToken.type
  ) {
    const _action = action as ReturnType<typeof updateWsHandshakeToken>
    if (_action.payload.isFirstAfterLogin) {
      store.dispatch(firstSyncIsDone())
    }
  }

  if (
    action.type === acceptServerResponse.type
    && store.getState().document.documentOnEdit.id === null
  ) {
    store.dispatch(selectLatestDocument())
  }
}
