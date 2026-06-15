const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: [
      "cypress/e2e/admin-users.cy.js",
      "cypress/e2e/dentist-worksheet.cy.js",
      "cypress/e2e/prothesist-worksheet.cy.js",
      "cypress/e2e/error-messages.cy.js",
    ],
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
