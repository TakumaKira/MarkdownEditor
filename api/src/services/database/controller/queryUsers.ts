import { ConnectionPool, sql } from '@databases/mysql';
import { UserInfoOnDB } from "../../../models/user";

export function _createUser(db: ConnectionPool) {
  return async function createUser(email: string, hashedPassword: string): Promise<void> {
    await db.query(sql`
      CALL create_user(${email}, ${hashedPassword});
    `)
  }
}

export function _activateUser(db: ConnectionPool) {
  return async function activateUser(email: string): Promise<{id: number, is_activated: boolean}> {
    return (await db.query(sql`
      CALL activate_user(${email});
    `))[0][0]
  }
}

export function _getUser(db: ConnectionPool) {
  return async function getUser(email: string): Promise<UserInfoOnDB | undefined> {
    return (await db.query(sql`
      CALL get_user(${email});
    `))[0][0]
  }
}

export function _updateUserEmail(db: ConnectionPool) {
  return async function updateUserEmail(userId: number, email: string): Promise<void> {
    await db.query(sql`
      CALL update_user(
        ${userId},
        ${email},
        NULL
      );
    `)
  }
}

export function _updateUserPassword(db: ConnectionPool) {
  return async function updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.query(sql`
      CALL update_user(
        ${userId},
        NULL,
        ${hashedPassword}
      );
    `)
  }
}

export function _deleteUser(db: ConnectionPool) {
  return async function deleteUser(userId: number): Promise<void> {
    await db.query(sql`
      CALL delete_user(
        ${userId}
      );
    `)
  }
}
