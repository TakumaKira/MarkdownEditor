import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { SESSION_UNAUTHORIZED_ERROR, acceptServerResponse, askServerUpdate, deleteSelectedDocument, newDocument, saveDocument, selectLatestDocument } from "../slices/document";
import { authConfirmationStateChanged, firstSyncIsDone, removeAuth, updateAuth } from '../slices/user';
import AuthConfirmationStateTypes from '../../types/AuthConfirmationStateTypes';

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
      const {wsHandshakeToken, email, isFirstAfterLogin} = payload
      store.dispatch(updateAuth({wsHandshakeToken, email, isFirstAfterLogin}))
      store.dispatch(acceptServerResponse(payload.response))
    }
  }

  if (
    action.type === askServerUpdate.rejected.type
  ) {
    const _action = action as ReturnType<typeof askServerUpdate.rejected>
    if (_action.payload === SESSION_UNAUTHORIZED_ERROR) {
      store.dispatch(authConfirmationStateChanged({type: AuthConfirmationStateTypes.SESSION_UNAUTHORIZED, email: store.getState().user.email}))
    } else {
      console.error(_action.error.message)
    }
  }

  if (
    action.type === authConfirmationStateChanged.type
  ) {
    store.dispatch(removeAuth())
  }

  if (
    action.type === updateAuth.type
  ) {
    const _action = action as ReturnType<typeof updateAuth>
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
