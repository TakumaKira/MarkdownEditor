import { StyleSheet } from 'react-native'
import colors from './colors';

// TODO: Make sure every property is on each theme.
const themeColors = {
  light: StyleSheet.create({
    editorHeaderBg: {
      backgroundColor: colors[200],
    },
    editorHeaderText: {
      color: colors[500],
    },
    editorBg: {
      backgroundColor: colors[100],
    },
    editorSeparator: {
      borderColor: colors[300],
    },
    editorMarkdown: {
      color: colors[700],
    },
    previewMarkdown: {
      color: colors[700],
    },
    blockBg: {
      backgroundColor: colors[200],
    },
    previewHeader: {
      color: colors[700],
    },
    previewParagraph: {
      color: colors[500],
    },
    previewParagraphBold: {
      color: colors[700],
    },
    documentTitleLabel: {
      color: colors[500],
    },
    modalBackgroundColor: {
      backgroundColor: colors[1000],
    },
    modalContentContainerBg: {
      backgroundColor: colors[100],
    },
    confirmationTitle: {
      color: colors[700],
    },
    confirmationMessage: {
      color: colors[500],
    },
    inputText: {
      color: colors[700],
    },
    inputUnderLabel: {
      color: colors[600],
    },
    inputUnderline: {
      color: colors[700],
    },
    link: {
      color: colors[700],
    },
  }),
  dark: StyleSheet.create({
    editorHeaderBg: {
      backgroundColor: colors[900],
    },
    editorHeaderText: {
      color: colors[400],
    },
    editorBg: {
      backgroundColor: colors[1000],
    },
    editorSeparator: {
      borderColor: colors[600],
    },
    editorMarkdown: {
      color: colors[400],
    },
    previewMarkdown: {
      color: colors[100],
    },
    blockBg: {
      backgroundColor: colors[800],
    },
    previewHeader: {
      color: colors[100],
    },
    previewParagraph: {
      color: colors[400],
    },
    previewParagraphBold: {
      color: colors[100],
    },
    documentTitleLabel: {
      color: colors[400],
    },
    modalBackgroundColor: {
      backgroundColor: colors[500],
    },
    modalContentContainerBg: {
      backgroundColor: colors[900],
    },
    confirmationTitle: {
      color: colors[100],
    },
    confirmationMessage: {
      color: colors[400],
    },
    inputText: {
      color: colors[100],
    },
    inputUnderLabel: {
      color: colors[500],
    },
    inputUnderline: {
      color: colors[100],
    },
    link: {
      color: colors[100],
    },
  }),
} as const

export default themeColors
