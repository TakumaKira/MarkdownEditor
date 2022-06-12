import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { RootState } from "../store";

export const storeData = async (value: RootState) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(Constants.manifest?.extra?.STATE_STORAGE_KEY, jsonValue)
  } catch (e) {
    console.error(e)
  }
}
export const getData = async (): Promise<RootState | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(Constants.manifest?.extra?.STATE_STORAGE_KEY)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.error(e)
    return null
  }
}
