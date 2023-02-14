import { DocumentFromDevice } from '../store/models/document'

export function sortDocumentsFromNewest(documents: DocumentFromDevice[]): DocumentFromDevice[] {
  return [...documents].sort(({updatedAt: a}, {updatedAt: b}) => a > b ? -1 : 1)
}
