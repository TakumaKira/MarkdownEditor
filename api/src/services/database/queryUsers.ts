import { sql } from ".";
import { UserInfoOnDB } from "../../models/user";
import db from "./connector";

export async function createUser(email: string, hashedPassword: string): Promise<void> {
  await db.query(sql`
    CALL create_user(${email}, ${hashedPassword});
  `)
}

export async function activateUser(email: string): Promise<{id: number, is_activated: boolean}> {
  return (await db.query(sql`
    CALL activate_user(${email});
  `))[0][0]
}

export async function getUser(email: string): Promise<UserInfoOnDB | undefined> {
  return (await db.query(sql`
    CALL get_user(${email});
  `))[0][0]
}

export async function updateUserEmail(userId: number, email: string): Promise<void> {
  await db.query(sql`
    CALL update_user(
      ${userId},
      ${email},
      NULL
    );
  `)
}
export async function updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
  await db.query(sql`
    CALL update_user(
      ${userId},
      NULL,
      ${hashedPassword}
    );
  `)
}

export async function deleteUser(userId: number): Promise<void> {
  await db.query(sql`
    CALL delete_user(
      ${userId}
    );
  `)
}
