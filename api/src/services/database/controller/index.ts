import { _getDocuments, _getNewSafeId, _getUserDocuments, _updateDocuments } from './queryDocuments'
import { _activateUser, _createUser, _deleteUser, _getUser, _getUserEmail, _updateUserEmail, _updateUserPassword } from './queryUsers'
import { DatabaseClient } from '../types'

export default class DatabaseController {
  constructor(private dbClient: DatabaseClient) {}

  createUser = _createUser(this.dbClient)
  activateUser = _activateUser(this.dbClient)
  getUser = _getUser(this.dbClient)
  getUserEmail = _getUserEmail(this.dbClient)
  updateUserEmail = _updateUserEmail(this.dbClient)
  updateUserPassword = _updateUserPassword(this.dbClient)
  deleteUser = _deleteUser(this.dbClient)

  updateDocuments = _updateDocuments(this.dbClient)
  getDocuments = _getDocuments(this.dbClient)
  getUserDocuments = _getUserDocuments(this.dbClient)
  getNewSafeId = _getNewSafeId(this.dbClient)
}
