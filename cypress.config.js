require("dotenv").config();
const mysql = require("mysql2/promise");

const { defineConfig } = require("cypress");

async function resetTestDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dentilib",
  };

  if (process.env.DB_SOCKET) {
    connectionConfig.socketPath = process.env.DB_SOCKET;
  }

  const connection = await mysql.createConnection(connectionConfig);

  try {
    await connection.query("DELETE FROM actes_fiche");
    await connection.query("DELETE FROM fiches_travaux");
    await connection.query("DELETE FROM actes_prothesiste");
    await connection.query("DELETE FROM actes");
    await connection.query("DELETE FROM utilisateurs");
    return null;
  } finally {
    await connection.end();
  }
}

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
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
