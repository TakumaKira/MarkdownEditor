import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../env';
import { RootStateRestore } from "../store";
import { DocumentState, DocumentStateOnAsyncStorage } from '../store/models/document';
import { ThemeState, ThemeStateOnAsyncStorage } from '../store/models/theme';
import { UserState, UserStateOnAsyncStorage } from '../store/models/user';

const asyncStorageKey = (key: string): string => `${env.STATE_STORAGE_KEY_BASE}_${key}`
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
export function filterUserStateToRestore(user: UserState): UserStateOnAsyncStorage {
  return {
    email: user.email,
    token: user.token,
  }
}
/** TODO: Test automatically check to not miss restoring any property. */
export function filterDocumentStateToRestore(document: DocumentState): DocumentStateOnAsyncStorage {
  return {
    documentList: document.documentList,
    documentOnEdit: {
      id: document.documentOnEdit.id
    },
    lastSyncWithDBAt: document.lastSyncWithDBAt,
  }
}
/** TODO: Test automatically check to not miss restoring any property. */
export function filterThemeStateToRestore(theme: ThemeState): ThemeStateOnAsyncStorage {
  return {
    deviceColorSchemeIsDark: theme.deviceColorSchemeIsDark,
    selectedColorSchemeIsDark: theme.selectedColorSchemeIsDark,
  }
}
