import { ConnectionPool, sql, SQLQuery } from '@databases/mysql'
import db from './connector'
import { getDocuments, getNewSafeId, getUserDocuments, updateDocuments } from './queryDocuments'
import { activateUser, createUser, deleteUser, getUser, updateUserEmail, updateUserPassword } from './queryUsers'
import { fromISOStringToDatetimeString, normalizeDocument } from './utils'

export default db
export {
  sql,
  ConnectionPool,
  SQLQuery,

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
