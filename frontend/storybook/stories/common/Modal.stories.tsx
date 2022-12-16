import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import Modal from '../../../components/common/Modal';
import themeColors from '../../../theme/themeColors';
import getMockStore from '../../utils/getMockStore';
import MockText from '../../utils/MockText';
import utilStyles from '../../utils/styles';
import ThemeWrapper from '../../utils/ThemeWrapper';

const mockStore = getMockStore()

const styles = StyleSheet.create({
  modalContent: {
    height: 218,
    width: 343,
    borderRadius: 4,
  },
})

storiesOf('Modal', module)
  .add('to Storybook', () =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={utilStyles.fullscreen}>
            <MockText colorScheme={colorScheme} />
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
