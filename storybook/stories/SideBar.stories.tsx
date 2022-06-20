import { storiesOf } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import SideBar from '../../components/SideBar';
import { useAppSelector } from '../../store/hooks';
import { Document } from '../../store/slices/document';
import { selectColorScheme } from '../../store/slices/theme';
import colors from '../../theme/colors';
import themeColors from '../../theme/themeColors';
import getMockStore from '../utils/getMockStore';

const mockStore = getMockStore()

const LONG_TITLE = 'Really really really very very very long long long title.md'
const documentWithLongTitle = (): Document => ({
  createdAt: '2022-04-01T00:00:00.000Z',
  lastUpdatedAt: '2022-04-01T00:00:00.000Z',
  name: LONG_TITLE,
  content: '',
  id: uuidv4(),
})
const mockStoreWithManyDocumentsWithLongTitle = getMockStore({
  document: {
    documentList: [
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
      documentWithLongTitle(),
    ],
    selectedDocumentId: null,
  },
  theme: {
    deviceColorSchemeIsDark: false,
    selectedColorSchemeIsDark: false,
  },
})

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
  },
})

const ThemeWrapper = (props: {children: JSX.Element}) => {
  const colorScheme = useAppSelector(selectColorScheme)
  return (
    <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
      {props.children}
    </View>
  )
}

storiesOf('SideBar', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <ThemeWrapper>
        <SideBar />
      </ThemeWrapper>
    </Provider>
  )
  .add('with many documents with long title', () =>
    <Provider store={mockStoreWithManyDocumentsWithLongTitle}>
      <ThemeWrapper>
        <SideBar />
      </ThemeWrapper>
    </Provider>
  )
