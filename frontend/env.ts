import Constants from 'expo-constants'
import { Platform } from "react-native";
import { ManifestExtra } from './app.config.manifestExtra';

if (Constants.manifest?.extra?.NODE_ENV !== 'test' && (
  Constants.manifest?.extra?.API_DOMAIN === undefined
  || Constants.manifest?.extra?.API_PORT === undefined
  || Constants.manifest?.extra?.WS_PORT === undefined
  || (Platform.OS !== 'web' && Constants.manifest?.extra?.WEB_VERSION_URL === undefined)
)) {
  if (Constants.manifest?.extra?.API_DOMAIN === undefined) {
    console.error('API_DOMAIN is not defined.')
  }
  if (Constants.manifest?.extra?.API_PORT === undefined) {
    console.error('API_PORT is not defined.')
  }
  if (Constants.manifest?.extra?.WS_PORT === undefined) {
    console.error('WS_PORT is not defined.')
  }
  if (Constants.manifest?.extra?.WEB_VERSION_URL === undefined) {
    console.error('WEB_VERSION_URL is not defined.')
  }
  throw new Error('Missing environment variables.')
}

const env = Constants.manifest?.extra as ManifestExtra
export default env