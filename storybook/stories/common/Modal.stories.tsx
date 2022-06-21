import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import Modal from '../../../components/common/Modal';
import { Text } from '../../../components/common/withCustomFont';
import textStyles from '../../../theme/textStyles';
import themeColors from '../../../theme/themeColors';
import getMockStore from '../../utils/getMockStore';
import ThemeWrapper from '../../utils/ThemeWrapper';

const mockStore = getMockStore()

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
  },
  modalContent: {
    height: 218,
    width: 343,
    borderRadius: 4,
  },
})

const LONG_TEXT = 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!'

storiesOf('Modal', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={styles.fullscreen}>
            <View style={[styles.fullscreen, themeColors[colorScheme].editorBg]}>
              {[...Array(5).keys()].map((_, i) =>
                <Text key={i} style={[textStyles.markdownCode, themeColors[colorScheme].editorMarkdown]}>{LONG_TEXT}</Text>
              )}
            </View>
            {boolean('show', true) &&
              <Modal onPressBackground={action('onPressBackground')}>
                <View style={[styles.modalContent, themeColors[colorScheme].modalContentContainerBg]} />
              </Modal>
            }
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
