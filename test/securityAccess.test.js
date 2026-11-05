const request = require("supertest");
const { randomUUID } = require("node:crypto");
const { serverURL, authHeader } = require("./helpers");

// Cette suite crée ses propres comptes et les supprime après les tests.
// Le serveur doit être lancé avec npm run start:test et Mailpit actif.
describe("Sécurité et validations — rôles et fiches", () => {
  const suffix = randomUUID();
  const password = "TestSecurity123!";
  const accountIds = [];
  let adminToken;
  let owner;
  let otherDentist;
  let otherProthesist;
  let worksheetId;

  async function login(email) {
    const res = await request(serverURL).post("/api/user/login")
      .send({ email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    return res.body.token;
  }

  async function createAccount(label, role, dentisteId) {
    const email = `${label}-${suffix}@example.test`;
    const res = await request(serverURL).post("/admin/user/createAccount")
      .set(authHeader(adminToken))
      .send({ firstName: label, lastName: "Test", email, password, role, dentisteId });
    expect(res.statusCode).toBe(201);
    const user = res.body.user || res.body.prothesiste;
    expect(user._id).toBeDefined();
    accountIds.push(user._id);
    return { ...user, token: await login(email) };
  }

  beforeAll(async () => {
    // Refuser la cible habituelle par défaut pour cette nouvelle suite.
    const target = new URL(serverURL);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) ||
        target.port !== "3001") {
      throw new Error("Utiliser TEST_URL=http://localhost:3001 et le serveur de test.");
    }
    const email = `admin-security-${suffix}@example.test`;
    const admin = await request(serverURL).post("/api/user/registerAdmin")
      .send({ firstName: "Admin", lastName: "Security", email, password });
    expect(admin.statusCode).toBe(201);
    adminToken = await login(email);

    owner = await createAccount("owner", "DENTISTE");
    otherDentist = await createAccount("other", "DENTISTE");
    await createAccount("owner-proto", "PROTHESISTE", owner._id);
    otherProthesist = await createAccount("other-proto", "PROTHESISTE", otherDentist._id);

    const created = await request(serverURL).post("/dentiste/worksheets/create")
      .set(authHeader(owner.token))
      .send({ nomPatient: "Fictif", prenomPatient: "Securite", emailPatient: "patient@example.test" });
    expect(created.statusCode).toBe(201);
    worksheetId = created.body.workSheet._id;
    const sent = await request(serverURL).put(`/dentiste/worksheets/send/${worksheetId}`)
      .set(authHeader(owner.token));
    expect(sent.statusCode).toBe(200);
  }, 30000);

  afterAll(async () => {
    if (!adminToken) return;
    // La suppression des comptes de cette suite supprime aussi leurs fiches.
    for (const id of [...accountIds].reverse()) {
      const res = await request(serverURL).delete(`/admin/user/deleteAccount/${id}`)
        .set(authHeader(adminToken));
      expect(res.statusCode).toBe(200);
    }
    const res = await request(serverURL).delete("/api/user/delete")
      .set(authHeader(adminToken));
    expect(res.statusCode).toBe(200);
  }, 30000);

  it("refuse la liste des utilisateurs à un dentiste connecté", async () => {
    const res = await request(serverURL).get("/admin/user/allUsers")
      .set(authHeader(owner.token));
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Accès refusé" });
  });

  it("refuse la liste des utilisateurs à un prothésiste connecté", async () => {
    const res = await request(serverURL).get("/admin/user/allUsers")
      .set(authHeader(otherProthesist.token));
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Accès refusé" });
  });

  it("refuse à un dentiste la lecture de la fiche d’un autre", async () => {
    const res = await request(serverURL).get(`/dentiste/worksheets/${worksheetId}`)
      .set(authHeader(otherDentist.token));
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Accès refusé" });
  });

  it("refuse la modification d’une fiche étrangère et conserve ses données", async () => {
    const before = await request(serverURL).get(`/dentiste/worksheets/${worksheetId}`)
      .set(authHeader(owner.token));
    expect(before.statusCode).toBe(200);
    const res = await request(serverURL).put(`/dentiste/worksheets/update/${worksheetId}`)
      .set(authHeader(otherDentist.token))
      .send({ nomPatient: "Modification interdite", remarque: "Ne doit pas être enregistrée" });
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Accès refusé" });
    const after = await request(serverURL).get(`/dentiste/worksheets/${worksheetId}`)
      .set(authHeader(owner.token));
    expect(after.statusCode).toBe(200);
    expect(after.body.workSheet).toEqual(before.body.workSheet);
  });

  it("refuse au prothésiste une fiche attribuée à un autre", async () => {
    const res = await request(serverURL).get(`/prothesiste/worksheets/${worksheetId}`)
      .set(authHeader(otherProthesist.token));
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Accès refusé" });
  });

  it("refuse un e-mail déjà utilisé sans créer de compte supplémentaire", async () => {
    const before = await request(serverURL).get("/admin/user/allUsers")
      .set(authHeader(adminToken));
    expect(before.statusCode).toBe(200);
    const res = await request(serverURL).post("/admin/user/createAccount")
      .set(authHeader(adminToken))
      .send({ firstName: "Doublon", lastName: "Test", email: owner.email, password, role: "DENTISTE" });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Cette adresse mail est déjà utilisée");
    const after = await request(serverURL).get("/admin/user/allUsers")
      .set(authHeader(adminToken));
    expect(after.statusCode).toBe(200);
    expect(after.body).toHaveLength(before.body.length);
    expect(after.body.filter(user => user.email === owner.email)).toHaveLength(1);
  });

  it("refuse une fiche incomplète via l’API sans créer de fiche", async () => {
    const before = await request(serverURL).get("/dentiste/worksheets")
      .set(authHeader(owner.token));
    expect(before.statusCode).toBe(200);
    const res = await request(serverURL).post("/dentiste/worksheets/create")
      .set(authHeader(owner.token)).send({ nomPatient: "Incomplet" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Nom, prénom et email du patient sont obligatoires");
    const after = await request(serverURL).get("/dentiste/worksheets")
      .set(authHeader(owner.token));
    expect(after.statusCode).toBe(200);
    expect(after.body.workSheets).toEqual(before.body.workSheets);
  });
});
