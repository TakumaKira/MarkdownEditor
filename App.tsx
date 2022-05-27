import Constants from 'expo-constants'
import 'react-native-get-random-values'
import MarkdownEditor from './components/MarkdownEditor'
import StorybookUI from './storybook'

const App = () => {
  return (
    <MarkdownEditor />
  )
}

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
