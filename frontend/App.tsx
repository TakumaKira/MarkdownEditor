import Constants from 'expo-constants'
import 'react-native-get-random-values'
import App from './components/App'
import StorybookUI from './storybook'

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
