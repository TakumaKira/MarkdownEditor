import { Document } from '../store/document'

export function sortDocumentsFromNewest(documents: Document[]): Document[] {
  return [...documents].sort(({lastUpdatedAt: a}, {lastUpdatedAt: b}) => a > b ? -1 : 1)
}
