import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import Modal from '../../../components/common/Modal';
import { Text } from '../../../components/common/withCustomFont';
import colors from '../../../theme/colors';
import textStyles from '../../../theme/textStyles';
import getMockStore, { preloadedStateInDarkScheme } from '../../utils/getMockStore';

const mockStore = getMockStore()
const mockStoreInDark = getMockStore(preloadedStateInDarkScheme)

const styles = StyleSheet.create({
  fullscreen: {
    height: '100%',
    width: '100%',
  },
  lightBg: {
    backgroundColor: colors[100],
  },
  lightText: {
    color: colors[700],
  },
  darkBg: {
    backgroundColor: colors[1000],
  },
  darkText: {
    color: colors[400],
  },
  modalContent: {
    height: 218,
    width: 343,
    borderRadius: 4,
  },
  modalContentBgColorLight: {
    backgroundColor: colors[100]
  },
  modalContentBgColorDark: {
    backgroundColor: colors[1000]
  },
})

const LONG_TEXT = 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum, labore similique? Ratione beatae totam nobis doloremque error esse aliquam molestias voluptatum perferendis. Dolorum accusantium blanditiis ducimus soluta, quibusdam et expedita!'

const Wrapper = (props: {children: React.ReactNode, dark?: boolean}): JSX.Element => {
  return (
    <Provider store={props.dark ? mockStoreInDark : mockStore}>
      <View style={styles.fullscreen}>
        <>
          <View style={[styles.fullscreen, props.dark ? styles.darkBg : styles.lightBg]}>
            {[...Array(5).keys()].map((_, i) =>
              <Text key={i} style={[textStyles.markdownCode, props.dark ? styles.darkText : styles.lightText]}>{LONG_TEXT}</Text>
            )}
          </View>
          {props.children}
        </>
      </View>
    </Provider>
  )
}

storiesOf('Modal', module)
  .add('in light scheme', () =>
    <Wrapper>
      {boolean('show', true) &&
        <Modal onPressBackground={action('onPressBackground')}>
          <View style={[styles.modalContent, styles.modalContentBgColorLight]} />
        </Modal>
      }
    </Wrapper>
  )
  .add('in dark scheme', () =>
    <Wrapper dark>
      {boolean('show', true) &&
        <Modal onPressBackground={action('onPressBackground')}>
          <View style={[styles.modalContent, styles.modalContentBgColorDark]} />
        </Modal>
      }
    </Wrapper>
  )
