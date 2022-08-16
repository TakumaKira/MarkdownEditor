import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { RootStateRestore } from "../store";
import { DocumentState, DocumentStateRestore } from '../store/models/document';

export const storeData = async <Key extends keyof RootStateRestore>(key: Key, value: RootStateRestore[Key]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(`${Constants.manifest?.extra?.STATE_STORAGE_KEY}_${key}`, jsonValue)
  } catch (e) {
    console.error(e)
  }
}
export const getData = async <Key extends keyof RootStateRestore>(key: Key): Promise<RootStateRestore[Key] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`${Constants.manifest?.extra?.STATE_STORAGE_KEY}_${key}`)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.error(e)
    return null
  }
}

/** TODO: Test automatically check to not miss restoring any property. */
export function filterToRestore(document: DocumentState): DocumentStateRestore {
  return {
    documentList: document.documentList,
    documentOnEdit: {
      id: document.documentOnEdit.id
    },
    latestUpdatedDocumentFromDBAt: document.latestUpdatedDocumentFromDBAt,
  }
}
