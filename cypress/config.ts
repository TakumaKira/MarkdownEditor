import { defineConfig } from 'cypress'
import db, { sql } from './support/database'

const config = defineConfig({
  projectId: 'fidmw8',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        clearUser(email: string) {
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
            SELECT documents.*, users.email
              FROM documents
                JOIN users
                ON documents.user_id = users.id
                WHERE users.email = ${email};
          `)
        },
      })
      require("cypress-localstorage-commands/plugin")(on, config);
      return config
    },
  },
});
export default config
