import Constants from 'expo-constants'
import 'react-native-get-random-values'
import { ManifestExtra } from './app.config.manifestExtra'
import App from './components/App'
import StorybookUI from './storybook'

export default (Constants.manifest?.extra as ManifestExtra)?.LOAD_STORYBOOK ? StorybookUI : App
