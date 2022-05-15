import React from "react"
import { StyleSheet, View } from 'react-native'
import LineMarkdown from "./line"
import ListBlock from "./listBlock"
import MultilineBlock from "./multilineBlock"

export default function render(input: string): JSX.Element {
  return (
    <>
      {blockLines(input.split('\n').filter(line => line !== ''))
        .map((line, i) =>
          <View key={i} style={i === 0 ? undefined : styles.block}>{line.render()}</View>
        )}
    </>
  )
}
const styles = StyleSheet.create({
  block: {
    marginTop: 20,
  },
})

export function blockLines(input: string[]): (ListBlock | MultilineBlock | LineMarkdown)[] {
  return ListBlock.find(MultilineBlock.find(input))
    .map(line =>
      typeof line === 'string'
        ? LineMarkdown.find(line)
        : line
    )
}
