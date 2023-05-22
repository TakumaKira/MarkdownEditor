import getDB from './connector'
import { _getDocuments, _getNewSafeId, _getUserDocuments, _updateDocuments } from './queryDocuments'
import { _activateUser, _createUser, _deleteUser, _getUser, _updateUserEmail, _updateUserPassword } from './queryUsers'
import { fromISOStringToDatetimeString, normalizeDocument } from './utils'

const db = getDB()

const createUser = _createUser(db)
const activateUser = _activateUser(db)
const getUser = _getUser(db)
const updateUserEmail = _updateUserEmail(db)
const updateUserPassword = _updateUserPassword(db)
const deleteUser = _deleteUser(db)

const updateDocuments = _updateDocuments(db)
const getDocuments = _getDocuments(db)
const getUserDocuments = _getUserDocuments(db)
const getNewSafeId = _getNewSafeId(db)

export {
  createUser,
  activateUser,
  getUser,
  updateUserEmail,
  updateUserPassword,
  deleteUser,

  updateDocuments,
  getUserDocuments,
  getDocuments,
  getNewSafeId,

  fromISOStringToDatetimeString,
  normalizeDocument,
}
