import React from "react"
import { StyleSheet, View } from 'react-native'
import LineMarkdown from "./line"
import ListBlock from "./listBlock"
import Markdown from "./markdown"
import MultilineBlock from "./multilineBlock"

export default function render(input: string): JSX.Element {
  // Re-use instances of Markdown when the line(s) are the same.
  const [blocks, setBlocks] = React.useState<Markdown[]>([])
  React.useEffect(() => {
    Markdown.fragmentsMemo = Markdown.fragmentsMemo.filter(fragment => !fragment.isUnmounted)

    const newBlocks = blockLines(input.split('\n').filter(line => line !== ''))
    setBlocks(prevBlocks => {
      const stock = [...prevBlocks]
      return newBlocks.map(newBlock => {
        for (let i = 0; i < stock.length; i++) {
          if (newBlock.constructor.name === stock[i].constructor.name && newBlock.is(stock[i])) {
            return stock.splice(i, 1)[0]
          }
        }
        return newBlock
      })
    })
  }, [input])

  return (
    <>{blocks.map((line, i) =>
      <View key={line.id} style={i === 0 ? undefined : styles.block}>{line.render()}</View>
    )}</>
  )
}
const styles = StyleSheet.create({
  block: {
    marginTop: 20,
  },
})

export function blockLines(input: string[]): Markdown[] {
  return ListBlock.find(MultilineBlock.find(input))
    .map(line =>
      typeof line === 'string'
        ? LineMarkdown.find(line)
        : line
    )
}
