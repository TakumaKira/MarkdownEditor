import React from "react"
import { StyleSheet, View } from 'react-native'
import Line from "./line"
import ListBlock from "./listBlock"
import MultilineBlock from "./multilineBlock"

export default function render(input: string): JSX.Element {
  // TODO: Prevent re-render when modified other block?
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

export function blockLines(input: string[]): (ListBlock | MultilineBlock | Line)[] {
  return ListBlock.find(MultilineBlock.find(input))
    .map(line =>
      typeof line === 'string'
        ? Line.find(line)
        : line
    )
}
