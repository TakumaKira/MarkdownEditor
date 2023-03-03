import 'react-native-get-random-values'
import { Provider } from 'react-redux'
import useApiAuth from '../hooks/useApiAuth'
import useConfirmUnsavedDocument from '../hooks/useConfirmUnsavedDocument'
import useRestore from '../hooks/useRestore'
import useLoadPath from '../hooks/useLoadPath'
import store from '../store'
import Layout from './Layout'
import { BrowserRouter } from './common/BrowserRouter'

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Hooks>
          <Layout />
        </Hooks>
      </BrowserRouter>
    </Provider>
  )
}
export default App

const Hooks = (props: {children: JSX.Element}): JSX.Element => {
  useRestore()
  useApiAuth()
  useConfirmUnsavedDocument()
  useLoadPath()
  return props.children
}
