import 'react-native-get-random-values'
import { Provider } from 'react-redux'
import useApiAuth from '../hooks/useApiAuth'
import useConfirmUnsavedDocument from '../hooks/useConfirmUnsavedDocument'
import useInitialization from '../hooks/useInitialization'
import useLoadInputFromUrlParams from '../hooks/useLoadInputFromUrlParams'
import store from '../store'
import Layout from './Layout'

const App = () => {
  return (
    <Provider store={store}>
      <Hooks>
        <Layout />
      </Hooks>
    </Provider>
  )
}
export default App

const Hooks = (props: {children: JSX.Element}): JSX.Element => {
  useInitialization()
  useApiAuth()
  useConfirmUnsavedDocument()
  useLoadInputFromUrlParams()
  return props.children
}
