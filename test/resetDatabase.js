require("dotenv").config();
const mysql = require("mysql2/promise");

async function resetTestDatabase() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  if (process.env.DB_SOCKET) {
    config.socketPath = process.env.DB_SOCKET;
  }

  if (
    process.env.NODE_ENV !== "test" ||
    config.database !== "dentilib_test" ||
    !["localhost", "127.0.0.1", "::1"].includes(config.host)
  ) {
    throw new Error(
      "Suppression refusée : utiliser dentilib_test en local."
    );
  }

  const connection = await mysql.createConnection(config);

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

module.exports = { resetTestDatabase };

if (require.main === module) {
  resetTestDatabase()
    .then(() => console.log("Base de test réinitialisée."))
    .catch((error) => {
      console.error("Réinitialisation impossible :", error.message);
      process.exitCode = 1;
    });
}
