import 'react-native-get-random-values'
import { Provider } from 'react-redux'
import { InputContextProvider } from '../contexts/inputContext'
import store from '../store'
import Layout from './Layout'

const App = () => {
  return (
    <Provider store={store}>
      <InputContextProvider>
        <Layout />
      </InputContextProvider>
    </Provider>
  )
}
export default App
