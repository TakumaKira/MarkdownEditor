import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import SideBar from '../../components/SideBar';
import { DocumentOnDevice } from '../../store/models/document';
import themeColors from '../../theme/themeColors';
import { LONG_TITLE } from '../utils/constants';
import getMockStore from '../utils/getMockStore';
import utilStyles from '../utils/styles';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

const documentWithLongTitle = (): DocumentOnDevice => ({
  id: uuidv4(),
  name: LONG_TITLE + '.md',
  content: '',
  createdAt: '2022-04-01T00:00:00.000Z',
  updatedAt: '2022-04-01T00:00:00.000Z',
  savedOnDBAt: '2022-04-01T00:00:01.000Z',
  isUploaded: false,
  isDeleted: false
})
const generateDocuments: (length: number) => DocumentOnDevice[] = length => {
  return [...Array(length).keys()].map(() => documentWithLongTitle())
}
const documents = generateDocuments(10)
const selectedDocumentIndex = 1
const mockStoreWithManyDocumentsWithLongTitle = getMockStore({
  document: {
    documentList: documents,
    documentOnEdit: {
      id: documents[selectedDocumentIndex].id,
      titleInput: documents[selectedDocumentIndex].name!,
      mainInput: documents[selectedDocumentIndex].content!,
    },
    lastSyncWithDBAt: null,
    confirmationState: null,
    restoreFromAsyncStorageIsDone: true,
    isAskingUpdate: false,
  },
  theme: {
    deviceColorSchemeIsDark: false,
    selectedColorSchemeIsDark: false,
    restoreIsDone: true,
  },
  user: {
    token: null,
    email: null,
    authState: null,
    restoreIsDone: true,
  },
  storeInitializationIsDone: true,
})

storiesOf('SideBar', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <ThemeWrapper>
        {colorScheme =>
          <View style={[utilStyles.fullscreen, themeColors[colorScheme].editorBg]}>
            <SideBar />
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
  .add('with many documents with long title', () =>
    <Provider store={mockStoreWithManyDocumentsWithLongTitle}>
      <ThemeWrapper>
        {colorScheme =>
          <View style={[utilStyles.fullscreen, themeColors[colorScheme].editorBg]}>
            <SideBar />
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
