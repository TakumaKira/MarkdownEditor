import { SafeAreaProvider } from 'react-native-safe-area-context'
import colors from '../theme/colors'
import CustomStatusBar from './common/CustomStatusBar'

const SafeArea = (props: {children: React.ReactNode}) => {
  return (
    <SafeAreaProvider>
      <CustomStatusBar backgroundColor={colors[900]} barStyle='light-content' />
      {props.children}
    </SafeAreaProvider>
  )
}
export default SafeArea