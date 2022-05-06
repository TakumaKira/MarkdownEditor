import { StyleSheet } from 'react-native'
import colors from './colors'
import fonts from './fonts'

const textStyles = StyleSheet.create({
  bodyM: {
    fontFamily: fonts.robotoLight,
    fontSize: 13,
    lineHeight: 15
  },
  headingM: {
    fontFamily: fonts.robotoRegular,
    fontSize: 15,
    lineHeight: 18
  },
  headingS: {
    fontFamily: fonts.robotoMedium,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 2
  },
  markdownCode: {
    fontFamily: fonts.robotoMonoRegular,
    fontSize: 14,
    lineHeight: 24
  },
  previewH1: {
    fontFamily: fonts.robotoSlabBold,
    fontSize: 32,
    lineHeight: 42
  },
  previewH2: {
    fontFamily: fonts.robotoSlabLight,
    fontSize: 28,
    lineHeight: 37
  },
  previewH3: {
    fontFamily: fonts.robotoSlabBold,
    fontSize: 24,
    lineHeight: 32
  },
  previewH4: {
    fontFamily: fonts.robotoSlabBold,
    fontSize: 20,
    lineHeight: 26
  },
  previewH5: {
    fontFamily: fonts.robotoSlabBold,
    fontSize: 16,
    lineHeight: 21
  },
  previewH6: {
    fontFamily: fonts.robotoSlabBold,
    fontSize: 14,
    lineHeight: 18
  },
  previewParagraph: {
    fontFamily: fonts.robotoSlabRegular,
    fontSize: 14,
    lineHeight: 24
  },
  previewParagraphBold: {
    fontFamily: fonts.robotoSlabBold,
    fontSize: 14,
    lineHeight: 24
  },
  title: {
    fontFamily: fonts.commissionerBold,
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: 5
  },
  link: {
    textDecorationLine: 'underline'
  },
  blockCode: {
    padding: 24,
    backgroundColor: colors[200],
  },
  blockQuote: {
    padding: 24,
    backgroundColor: colors[200],
  },
  indent: {
    paddingLeft: 24,
  },
  indentedLines: {
    marginTop: 4,
  }
})

export default textStyles