const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'fidmw8',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
