import { defineConfig } from 'cypress'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import db, { sql } from './support/database'
import { Document } from '../api/src/models/document'
import { fromISOStringToTimestamp } from './support/utils';

const config = defineConfig({
  projectId: 'fidmw8',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        createUser(credentials: {email: string, password: string, isActivated: boolean}) {
          const salt = bcrypt.genSaltSync(10)
          const hashedPassword = bcrypt.hashSync(credentials.password, salt)
          return db.query(sql`
            INSERT INTO users (
              email,
              hashed_password,
              is_activated
            )
            VALUES (
              ${credentials.email},
              ${hashedPassword},
              ${credentials.isActivated}
            )
          `)
        },
        deleteUser(email: string) {
          return db.query(sql`
            DELETE FROM users
              WHERE email = ${email};
          `)
        },
        deactivateUser(email: string) {
          return db.query(sql`
            UPDATE users
              SET is_activated = FALSE
              WHERE email = ${email};
          `)
        },
        changeEmail(email: {from: string, to: string}) {
          return db.query(sql`
            UPDATE users
              SET email = ${email.to}
              WHERE email = ${email.from};
          `)
        },
        getUser(email: string) {
          return db.query(sql`
            SELECT *
              FROM users
              WHERE email = ${email};
          `)
        },
        getUserDocuments(email: string) {
          return db.query(sql`
            SELECT
              documents.*,
              users.email,
              UNIX_TIMESTAMP(documents.created_at) AS created_at,
              UNIX_TIMESTAMP(documents.updated_at) AS updated_at,
              UNIX_TIMESTAMP(documents.saved_on_db_at) AS saved_on_db_at
            FROM documents
              JOIN users
              ON documents.user_id = users.id
              WHERE users.email = ${email};
          `)
        },
        clearUserDocuments(email: string) {
          return db.query(sql`
            DELETE
              FROM documents
              WHERE user_id = (
                SELECT id
                  FROM users
                  WHERE email = ${email}
              );
          `)
        },
        updateDocumentsOnDB(data: {email: string, documents: Document[]}) {
          return db.tx(async _db => {
            const userId: number = (await _db.query(sql`
              SELECT id
                FROM users
                WHERE email = ${data.email};
            `))[0].id
            for (const document of data.documents) {
              await _db.query(sql`
                CALL update_document (
                  ${document.id},
                  ${userId},
                  ${document.name !== null ? document.name : null},
                  ${document.content !== null ? document.content : null},
                  ${fromISOStringToTimestamp(document.createdAt)},
                  ${fromISOStringToTimestamp(document.updatedAt)},
                  ${fromISOStringToTimestamp(document.savedOnDBAt)},
                  ${document.isDeleted}
                );
              `)
            }
            return null
          })
        },
        generateSignupToken(email: string) {
          return jwt.sign(
            {is: 'SignupToken', email},
            process.env.API_JWT_SECRET_KEY
          )
        },
        generateEmailChangeToken(payload: {oldEmail: string, newEmail: string}) {
          return jwt.sign(
            {is: 'EmailChangeToken', oldEmail: payload.oldEmail, newEmail: payload.newEmail},
            process.env.API_JWT_SECRET_KEY,
            {expiresIn: '30m'}
          )
        },
        generateResetPasswordToken(email: string) {
          return jwt.sign(
            {is: 'ResetPasswordToken', email},
            process.env.API_JWT_SECRET_KEY,
            {expiresIn: '30m'}
          )
        },
      }),
      require("cypress-localstorage-commands/plugin")(on, config);
      return config
    },
  },
});
export default config
