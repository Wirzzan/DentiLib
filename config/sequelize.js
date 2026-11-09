require("dotenv").config();

const fs = require("node:fs");
const { Sequelize } = require("sequelize");

const dialectOptions = {};
// Connexion MySQL locale par socket Unix, si configurée.
if (process.env.DB_SOCKET) {
  dialectOptions.socketPath = process.env.DB_SOCKET;
}

if (process.env.NODE_ENV === "production" && !process.env.DB_SSL_CA_PATH) {
  throw new Error("Le certificat CA MySQL est requis en production.");
}

if (process.env.DB_SSL_CA_PATH) {
  dialectOptions.ssl = {
    ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
    rejectUnauthorized: true,
    verifyIdentity: true,
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME || "dentilib",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    dialectOptions,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

const formatConnectionError = (error) => {
  const code = error.original?.code || error.parent?.code;
  const nested = error.original?.errors?.[0];

  if (code === "ECONNREFUSED") {
    return (
      "MySQL injoignable (ECONNREFUSED). Dans XAMPP, cliquez « Start » sur MySQL " +
      "(pas seulement Apache). Vérifiez le port 3306 ou définissez DB_SOCKET dans .env."
    );
  }

  if (code === "ER_ACCESS_DENIED_ERROR") {
    return "Accès MySQL refusé : vérifiez DB_USER et DB_PASSWORD dans .env.";
  }

  if (code === "ER_BAD_DB_ERROR") {
    return `La base « ${process.env.DB_NAME} » n'existe pas. Créez-la dans phpMyAdmin.`;
  }

  return (
    error.message ||
    nested?.message ||
    error.original?.message ||
    String(error)
  );
};

const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL successfully");

    if (process.env.DB_SYNC === "true") {
      const db = require("../models");
      await db.sequelize.sync();
      console.log("MySQL tables synced");
    }
  } catch (error) {
    console.error("MySQL connection error:", formatConnectionError(error));
    // Transmettre l’échec au démarrage du serveur.
    throw error;
  }
};

module.exports = { sequelize, connectSequelize };
