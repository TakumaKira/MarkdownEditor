import { Document } from '../store/models/document'

export function sortDocumentsFromNewest(documents: Document[]): Document[] {
  return [...documents].sort(({updatedAt: a}, {updatedAt: b}) => a > b ? -1 : 1)
}
