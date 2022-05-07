import { InlineMarkdownType, ListBlockType, MultilineBlockType } from "./types"

export type Block = {
  type: ListBlockType | MultilineBlockType
  lines: string[]
}

export type FoundMarkdown = {
  type: InlineMarkdownType
  content: string
  renderFragment: () => JSX.Element
}
export type FoundMarkdownWithIndex = FoundMarkdown & {
  index: number
}
