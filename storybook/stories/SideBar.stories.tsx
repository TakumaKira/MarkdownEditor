import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import SideBar from '../../components/SideBar';
import { Document } from '../../store/slices/document';
import themeColors from '../../theme/themeColors';
import { LONG_TITLE } from '../utils/constants';
import getMockStore from '../utils/getMockStore';
import utilStyles from '../utils/styles';
import ThemeWrapper from '../utils/ThemeWrapper';

const mockStore = getMockStore()

const documentWithLongTitle = (): Document => ({
  createdAt: '2022-04-01T00:00:00.000Z',
  lastUpdatedAt: '2022-04-01T00:00:00.000Z',
  name: LONG_TITLE + '.md',
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
