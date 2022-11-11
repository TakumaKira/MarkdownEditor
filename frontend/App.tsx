import 'react-native-get-random-values'
import App from './components/App'
import StorybookUI from './storybook'
import env from './env'

export default env.LOAD_STORYBOOK ? StorybookUI : App
