// Prérequis : npm start (serveur + MySQL) dans un autre terminal
const request = require("supertest");
const { serverURL, getAdminToken, authHeader } = require("./helpers");

let tokenAdmin;

beforeAll(async () => {
  tokenAdmin = await getAdminToken();
});

describe("POST - create User", () => {
  it("ça doit créer un nouveau dentiste", async () => {
    const res = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "dentiste1",
        lastName: "adminLastName",
        email: "dentiste1@test.com",
        password: "123456789",
        role: "DENTISTE",
        siret: "12345678900011",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Le dentiste a été créé");
    expect(res.body.user.role).toBe("DENTISTE");
  });

  it("ça doit créer un nouveau prothésiste", async () => {
    const dentisteRes = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "dentiste2",
        lastName: "Dent",
        email: "dentiste2@test.fr",
        password: "password123",
        role: "DENTISTE",
      });

    const dentisteId = dentisteRes.body.user._id;

    const res = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "proto1",
        lastName: "Proto",
        email: "proto1@test.fr",
        password: "password123",
        role: "PROTHESISTE",
        dentisteId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Prothesiste created and linked to dentiste");
    expect(res.body.prothesiste.role).toBe("PROTHESISTE");
    expect(String(res.body.prothesiste.associatedUserId)).toBe(String(dentisteId));
  });

  it("doit refuser la création d'un prothésiste sans dentisteId", async () => {
    const res = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "proto2",
        lastName: "Proto",
        email: "proto2@test.fr",
        password: "password123",
        role: "PROTHESISTE",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("dentisteId is required for prothesiste");
  });

  it("doit refuser un dentisteId inexistant", async () => {
    const res = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "proto3",
        lastName: "Proto",
        email: "proto3@test.fr",
        password: "password123",
        role: "PROTHESISTE",
        dentisteId: 99999,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Dentiste not found");
  });

  it("doit refuser si dentisteId ne correspond pas à un DENTISTE", async () => {
    const adminRes = await request(serverURL).post("/api/user/registerAdmin").send({
      firstName: "Admin",
      lastName: "Test",
      email: "adminProto@test.fr",
      password: "password123",
    });

    const adminId = adminRes.body.user._id;

    const res = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "proto4",
        lastName: "Error",
        email: "proto4@test.fr",
        password: "password123",
        role: "PROTHESISTE",
        dentisteId: adminId,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Dentiste not found");
  });

  it("doit refuser la création avec un rôle invalide", async () => {
    const res = await request(serverURL)
      .post("/admin/user/createAccount")
      .set(authHeader(tokenAdmin))
      .send({
        firstName: "Bad",
        lastName: "Role",
        email: "badrole@test.fr",
        password: "password123",
        role: "PATIENT",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });
});
