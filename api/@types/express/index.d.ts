import { UserInfoOnAuthToken } from '../../src/models/user'
import { DocumentsRequest } from '../../src/models/document'

declare global {
  namespace Express {
    interface Request {
      user: UserInfoOnAuthToken
      documentsRequest: DocumentsRequest
    }
  }
}