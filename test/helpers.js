const request = require("supertest");

const serverURL = process.env.TEST_URL || "http://localhost:3000";

// Crée un admin et retourne son token (pour les routes /admin)
async function getAdminToken() {
  const email = `admin_test_${Date.now()}@test.com`;

  await request(serverURL).post("/api/user/registerAdmin").send({
    email,
    firstName: "Admin",
    lastName: "Test",
    password: "123456789",
  });

  const login = await request(serverURL).post("/api/user/login").send({
    email,
    password: "123456789",
  });

  return login.body.token;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { serverURL, getAdminToken, authHeader };
