import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react-native'
import React from 'react'
import { View } from 'react-native'
import { Provider } from 'react-redux'
import env from '../../env'
import Preview from '../../components/Preview'
import themeColors from '../../theme/themeColors'
import getMockStore from '../utils/getMockStore'
import utilStyles from '../utils/styles'
import ThemeWrapper from '../utils/ThemeWrapper'

const imageSUrl = 'https://picsum.photos/id/10/50'
const imageMUrl = 'https://picsum.photos/id/1000/200'
const imageLUrl = 'https://picsum.photos/id/1002/300'
const imageSMarkdown = `![imageS](${imageSUrl})`
const imageMMarkdown = `![imageM](${imageMUrl})`
const imageLMarkdown = `![imageL](${imageLUrl})`
const svgUrl = 'https://img.shields.io/badge/license-MIT-blue.svg'
const svgMarkdown = `![svg](${svgUrl})`
const linkUrl = 'https://google.com'

const mockStore = getMockStore()

storiesOf('Preview', module)
  .addDecorator(story =>
    <Provider store={mockStore}>
      <ThemeWrapper isDark={boolean('dark mode', false)}>
        {colorScheme =>
          <View style={[utilStyles.fullscreen, themeColors[colorScheme].editorBg]}>
            <>{story()}</>
          </View>
        }
      </ThemeWrapper>
    </Provider>
  )
  .add('Preview', () =>
    <Preview children={(env.INITIAL_DOCUMENTS?.[0]?.content as string)} />
  )
  // This already has some trouble with displaying inline image on iOS and android
  .add('Preview - Inline Image test', () =>
    <Preview children={`test${imageSMarkdown}test`} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  // This problem on android is not bearable
  .add('Preview - Double Inline Image test', () =>
    <Preview children={`test${imageSMarkdown}test${imageMMarkdown}test`} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  // This breaks UI on iOS
  .add('Preview - Triple Inline Image test', () =>
    <Preview children={`test${imageSMarkdown}test${imageMMarkdown}test${imageLMarkdown}test`} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  .add('Preview - SVG Image test', () =>
    <Preview children={`test${svgMarkdown}test`} disableImageEscapeOnMobile={boolean('Disable Image Escape on iOS/Android', false)} />
  )
  .add('Preview - Inline Image Link test', () =>
    <Preview children={`test[test${imageSMarkdown}**test**${imageSMarkdown}test](${linkUrl})test`} />
  )
