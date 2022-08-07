import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { RootState } from "../store";

export const storeData = async <Key extends keyof RootState>(key: Key, value: RootState[Key]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(`${Constants.manifest?.extra?.STATE_STORAGE_KEY}_${key}`, jsonValue)
  } catch (e) {
    console.error(e)
  }
}
export const getData = async <Key extends keyof RootState>(key: Key): Promise<RootState[Key] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`${Constants.manifest?.extra?.STATE_STORAGE_KEY}_${key}`)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.error(e)
    return null
  }
}
