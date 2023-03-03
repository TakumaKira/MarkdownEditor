import { DocumentFromDevice } from '@api/document'

export function sortDocumentsFromNewest(documents: DocumentFromDevice[]): DocumentFromDevice[] {
  return [...documents].sort(({updatedAt: a}, {updatedAt: b}) => a > b ? -1 : 1)
}
