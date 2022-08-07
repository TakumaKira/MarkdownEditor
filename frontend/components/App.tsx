import 'react-native-get-random-values'
import { Provider } from 'react-redux'
import { AuthContextProvider } from '../contexts/authContext'
import { InputContextProvider } from '../contexts/inputContext'
import store from '../store'
import Layout from './Layout'

const App = () => {
  return (
    <Provider store={store}>
      <AuthContextProvider>
        <InputContextProvider>
          <Layout />
        </InputContextProvider>
      </AuthContextProvider>
    </Provider>
  )
}
export default App
