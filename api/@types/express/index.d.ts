import { UserInfoOnAuthToken } from '../../src/models/user'
import { DocumentsUpdateRequest } from '../../src/models/document'

declare global {
  namespace Express {
    interface Request {
      user: UserInfoOnAuthToken
      documentsRequest: DocumentsUpdateRequest
    }
  }
}