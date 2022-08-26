import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { RootStateRestore } from "../store";
import { DocumentState, DocumentStateRestore } from '../store/models/document';
import { ThemeState, ThemeStateRestore } from '../store/models/theme';
import { UserState, UserStateRestore } from '../store/models/user';

const asyncStorageKey = (key: string): string => `${Constants.manifest?.extra?.STATE_STORAGE_KEY}_${key}`
export const storeData = async <Key extends keyof RootStateRestore>(key: Key, value: RootStateRestore[Key]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(asyncStorageKey(key), jsonValue)
  } catch (e) {
    console.error(e)
  }
}
export const getData = async <Key extends keyof RootStateRestore>(key: Key): Promise<RootStateRestore[Key] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(asyncStorageKey(key))
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.error(e)
    return null
  }
}

/** TODO: Test automatically check to not miss restoring any property. */
export function filterUserStateToRestore(user: UserState): UserStateRestore {
  return {
    email: user.email,
    token: user.token,
  }
}
/** TODO: Test automatically check to not miss restoring any property. */
export function filterDocumentStateToRestore(document: DocumentState): DocumentStateRestore {
  return {
    documentList: document.documentList,
    documentOnEdit: {
      id: document.documentOnEdit.id
    },
    latestUpdatedDocumentFromDBAt: document.latestUpdatedDocumentFromDBAt,
  }
}
/** TODO: Test automatically check to not miss restoring any property. */
export function filterThemeStateToRestore(theme: ThemeState): ThemeStateRestore {
  return {
    deviceColorSchemeIsDark: theme.deviceColorSchemeIsDark,
    selectedColorSchemeIsDark: theme.selectedColorSchemeIsDark,
  }
}
