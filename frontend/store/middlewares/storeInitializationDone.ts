import { AnyAction } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { RootState } from "..";
import { storeInitializationDone } from '../slices/storeInitializationIsDone';

export const storeInitializationDoneMiddleware: ThunkMiddleware<RootState, AnyAction> = store => next => action => {
  next(action)

  const state = store.getState()
  if (
    !state.storeInitializationIsDone
    && state.user.restoreIsDone
    && state.document.restoreIsDone
    && state.theme.restoreIsDone
  ) {
    next(storeInitializationDone())
  }
}
