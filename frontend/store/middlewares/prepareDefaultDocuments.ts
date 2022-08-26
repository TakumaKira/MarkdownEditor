import { Middleware } from "@reduxjs/toolkit";
import Constants from 'expo-constants';
import { RootState } from "..";
import { filterDocumentStateToRestore, storeData } from "../../services/asyncStorage";
import { acceptServerResponse, addDocuments } from "../slices/document";

export const prepareDefaultDocumentsMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === acceptServerResponse.type
  ) {
    const documentState = store.getState().document
    /** TODO: Make sure the type. */
    const initialDocuments: {name: string, content: string}[] = Constants.manifest?.extra?.INITIAL_DOCUMENTS
    if (initialDocuments) {
      const needToAdd = initialDocuments
        .filter(({name, content}) => documentState.documentList.every(({name: n, content: c}) => name !== n || content !== c))
      if (needToAdd.length > 0) {
        next(addDocuments(needToAdd))
      } else {
        storeData('document', filterDocumentStateToRestore(documentState))
      }
    }
  }
}
