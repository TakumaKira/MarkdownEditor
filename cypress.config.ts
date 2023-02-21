import { defineConfig } from 'cypress'
import db, { sql } from './cypress/support/database'

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
        }
      })
      require("cypress-localstorage-commands/plugin")(on, config);
      return config
    },
  },
});
export default config
