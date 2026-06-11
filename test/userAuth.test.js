// Prérequis : npm start (serveur + MySQL) dans un autre terminal
const request = require("supertest");
const { serverURL } = require("./helpers");

let tokenAdmin;

describe("POST - create Admin", () => {
  it("ça doit créer un nouvel admin", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test@gmail.com",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123456789",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("admin_test@gmail.com");
  });

  it("créer un admin avec un mail qui existe déjà", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test@gmail.com",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123456789",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Email déjà utilisé");
  });

  it("ça doit retourner un message d'erreur (email invalide)", async () => {
    const res = await request(serverURL).post("/api/user/registerAdmin").send({
      email: "admin_test",
      firstName: "admin",
      lastName: "adminLastName",
      password: "123456789",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email invalide");
  });

  it("ça doit retourner un message d'erreur (mdp < 6)", async () => {
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

describe("POST - Login", () => {
  it("ça doit retourner un token en cas de succès", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "admin_test@gmail.com",
      password: "123456789",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe("ADMIN");

    tokenAdmin = res.body.token;
  });

  it("ça doit retourner une erreur en cas de faux mot de passe", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "admin_test@gmail.com",
      password: "mdp invalide",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Mot de passe incorrect");
  });

  it("ça doit retourner une erreur si utilisateur inexistant", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "faux_admin_test@gmail.com",
      password: "mdp invalide",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("L'utilisateur n'existe pas");
  });

  it("ça doit retourner une erreur si email vide", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "",
      password: "mdp invalide",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Tous les champs sont requis");
  });

  it("ça doit retourner une erreur si mot de passe vide", async () => {
    const res = await request(serverURL).post("/api/user/login").send({
      email: "admin_test@gmail.com",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Tous les champs sont requis");
  });
});

describe("DELETE - delete User", () => {
  it("ça doit supprimer un admin", async () => {
    const res = await request(serverURL)
      .delete("/api/user/delete")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Utilisateur supprimé avec succès");
  });

  it("ça doit refuser la suppression sans token", async () => {
    const res = await request(serverURL).delete("/api/user/delete");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Token manquant ou invalide");
  });

  it("ça doit retourner une erreur si user déjà supprimé", async () => {
    const res = await request(serverURL)
      .delete("/api/user/delete")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Utilisateur non trouvé");
  });
});
