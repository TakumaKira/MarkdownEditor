import { DocumentsUpdateRequest } from '../../src/models/document'

declare global {
  namespace Express {
    interface Request {
      documentsRequest: DocumentsUpdateRequest
    }
  }
}