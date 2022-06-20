import { action } from '@storybook/addon-actions';
import { boolean, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { Text } from '../../components/common/withCustomFont';
import Confirmation from '../../components/Confirmation';
import { confirmationMessages } from '../../constants/confirmationMessages';
import { ConfirmationState } from '../../contexts/inputContext';
import colors from '../../theme/colors';
import textStyles from '../../theme/textStyles';
import getMockStore, { preloadedStateInDarkScheme } from '../mockStore/getMockStore';

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
})

const LONG_TITLE = 'Really really really very very very long long long title'
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

storiesOf('Confirmation', module)
  .add('Delete in light scheme', () =>
    <Wrapper>
      {boolean('show', true) &&
        <Confirmation
          title={text('title', confirmationMessages[ConfirmationState.DELETE].title)}
          message={text('message', confirmationMessages[ConfirmationState.DELETE].message('Document Title.md'))}
          buttonLabel={text('button label', confirmationMessages[ConfirmationState.DELETE].buttonLabel).replace('&amp;', '&')}
          onPressButton={action('onPressButton')}
          onPressBackground={action('onPressBackground')}
        />
      }
    </Wrapper>
  )
  .add('Delete in dark scheme', () =>
    <Wrapper dark>
      {boolean('show', true) &&
        <Confirmation
          title={text('title', confirmationMessages[ConfirmationState.DELETE].title)}
          message={text('message', confirmationMessages[ConfirmationState.DELETE].message('Document Title.md'))}
          buttonLabel={text('button label', confirmationMessages[ConfirmationState.DELETE].buttonLabel).replace('&amp;', '&')}
          onPressButton={action('onPressButton')}
          onPressBackground={action('onPressBackground')}
        />
      }
    </Wrapper>
  )
  .add('Leaved unsaved document in light scheme', () =>
    <Wrapper>
      {boolean('show', true) &&
        <Confirmation
          title={text('title', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].title)}
          message={text('message', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].message('Document Title.md'))}
          buttonLabel={text('button label', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].buttonLabel).replace('&amp;', '&')}
          onPressButton={action('onPressButton')}
          onPressBackground={action('onPressBackground')}
        />
      }
    </Wrapper>
  )
  .add('Leaved unsaved document in dark scheme', () =>
    <Wrapper dark>
      {boolean('show', true) &&
        <Confirmation
          title={text('title', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].title)}
          message={text('message', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].message('Document Title.md'))}
          buttonLabel={text('button label', confirmationMessages[ConfirmationState.LEAVE_UNSAVED_DOCUMENT].buttonLabel).replace('&amp;', '&')}
          onPressButton={action('onPressButton')}
          onPressBackground={action('onPressBackground')}
        />
      }
    </Wrapper>
  )
  .add('Long text in light scheme', () =>
    <Wrapper>
      {boolean('show', true) &&
        <Confirmation
          title={text('title', LONG_TITLE)}
          message={text('message', LONG_TEXT)}
          buttonLabel={text('button label', 'Click')}
          onPressButton={action('onPressButton')}
          onPressBackground={action('onPressBackground')}
        />
      }
    </Wrapper>
  )
  .add('Long text in dark scheme', () =>
    <Wrapper dark>
      {boolean('show', true) &&
        <Confirmation
          title={text('title', LONG_TITLE)}
          message={text('message', LONG_TEXT)}
          buttonLabel={text('button label', 'Click')}
          onPressButton={action('onPressButton')}
          onPressBackground={action('onPressBackground')}
        />
      }
    </Wrapper>
  )
