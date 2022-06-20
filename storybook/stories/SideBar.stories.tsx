import { storiesOf } from '@storybook/react-native';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import SideBar from '../../components/SideBar';
import { Document } from '../../store/slices/document';
import getMockStore from '../mockStore/getMockStore';

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

storiesOf('SideBar', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <SideBar />
    </Provider>
  )
  .add('with many documents with long title', () =>
    <Provider store={mockStoreWithManyDocumentsWithLongTitle}>
      <SideBar />
    </Provider>
  )
