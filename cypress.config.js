require("dotenv").config();
const { resetTestDatabase } = require("./test/resetDatabase");

const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    specPattern: [
      "cypress/e2e/00-reset-db.cy.js",
      "cypress/e2e/admin-users.cy.js",
      "cypress/e2e/dentist-worksheet.cy.js",
      "cypress/e2e/prothesist-worksheet.cy.js",
      "cypress/e2e/error-messages.cy.js",
    ],
    setupNodeEvents(on, config) {
      on("task", {
        resetTestDatabase,
      });
      return config;
    },
  },
});
