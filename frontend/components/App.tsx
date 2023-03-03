import 'react-native-get-random-values'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux'
import useApiAuth from '../hooks/useApiAuth'
import useConfirmUnsavedDocument from '../hooks/useConfirmUnsavedDocument'
import useRestore from '../hooks/useRestore'
import useLoadPath from '../hooks/useLoadPath'
import store from '../store'
import Layout from './Layout'

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
