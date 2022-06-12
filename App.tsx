import Constants from 'expo-constants'
import 'react-native-get-random-values'
import { Provider } from 'react-redux'
import Layout from './components/Layout'
import store from './store'
import StorybookUI from './storybook'
import { InputContextProvider } from './contexts/inputContext'

export const App = () => {
  return (
    <Provider store={store}>
      <InputContextProvider>
        <Layout />
      </InputContextProvider>
    </Provider>
  )
}

export default Constants.manifest?.extra?.loadStorybook ? StorybookUI : App
