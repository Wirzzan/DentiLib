// Prérequis : npm start (serveur + MySQL) dans un autre terminal
const request = require("supertest");
const { serverURL } = require("./helpers");

let tokenAdmin;

describe("Compte administrateur — inscription", () => {
  it("Création d'un compte administrateur", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test@gmail.com",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123456789",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("admin_test@gmail.com");
  });

  it("Création compte admin avec un mail existant", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test@gmail.com",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123456789",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Email déjà utilisé");
  });

  it("Création compte admin avec un email invalide", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123456789",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email invalide");
  });

  it("Création compte admin avec un mot de passe trop court", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test@gmail.com",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Le mot de passe doit contenir plus de 6 caractères");
  });
});

describe("Compte administrateur — connexion", () => {
  it("Connexion admin réussie", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "admin_test@gmail.com",
      password: "123456789",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe("ADMIN");

    tokenAdmin = res.body.token;
  });

  it("Tentative de connexion admin avec mot de passe incorrect", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "admin_test@gmail.com",
      password: "mdp invalide",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Mot de passe incorrect");
  });

  it("Tentative de connexion admin avec email inexistant", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "faux_admin_test@gmail.com",
      password: "mdp invalide",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("L'utilisateur n'existe pas");
  });

  it("Tentative de connexion admin avec email vide", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "",
      password: "mdp invalide",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Tous les champs sont requis");
  });

  it("Tentative de connexion admin avec mot de passe vide", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "admin_test@gmail.com",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Tous les champs sont requis");
  });
});

describe("Compte administrateur — suppression", () => {
  it("Suppression du compte administrateur", async () => {
    const res = await request(serverURL)
      .delete("/api/user/delete")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Utilisateur supprimé avec succès");
  });

  it("Tentative de suppression de compte sans token JWT", async () => {
    const res = await request(serverURL).delete("/api/user/delete");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Token manquant ou invalide");
  });

  it("Tentative de suppression d'un compte admin déjà supprimé", async () => {
    const res = await request(serverURL)
      .delete("/api/user/delete")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Utilisateur non trouvé");
  });
});
