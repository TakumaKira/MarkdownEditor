import AsyncStorage from '@react-native-async-storage/async-storage';
import { Middleware } from "@reduxjs/toolkit";
import Constants from 'expo-constants';
import { RootState } from "..";
import { deleteSelectedDocument, newDocument, saveDocument, selectDocument, selectLatestDocument } from "../slices/document";

export const asyncStorageMiddleware: Middleware<{}, RootState> = store => next => action => {
  next(action)

  if (
    action.type === newDocument.type
    || action.type === selectDocument.type
    || action.type === saveDocument.type
    || action.type === deleteSelectedDocument.type
    || action.type === selectLatestDocument.type
  ) {
    storeData(store.getState())
  }
}

export const storeData = async (value: RootState) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(Constants.manifest?.extra?.STATE_STORAGE_KEY, jsonValue)
  } catch (e) {
    console.log(e)
  }
}
export const getData = async (): Promise<RootState | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(Constants.manifest?.extra?.STATE_STORAGE_KEY)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.log(e)
    return null
  }
}
