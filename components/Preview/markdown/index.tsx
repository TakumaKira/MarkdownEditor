import React from "react"
import Line from "./line"
import ListBlock from "./listBlock"
import MultilineBlock from "./multilineBlock"

export default function render(input: string): JSX.Element {
  return (
    <>
      {blockLines(input.split('\n'))
        .map((line, i) => <React.Fragment key={i}>{line.render()}</React.Fragment>)}
    </>
  )
}

export function blockLines(input: string[]): (ListBlock | MultilineBlock | Line)[] {
  return ListBlock.find(MultilineBlock.find(input))
    .map(line =>
      typeof line === 'string'
        ? Line.find(line)
        : line
    )
}
