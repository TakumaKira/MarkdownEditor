import { DocumentOnDevice } from '../store/models/document'

export function sortDocumentsFromNewest(documents: DocumentOnDevice[]): DocumentOnDevice[] {
  return [...documents].sort(({updatedAt: a}, {updatedAt: b}) => a > b ? -1 : 1)
}
