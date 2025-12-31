// e2e/admin.cy.js
describe("Admin Flow: Users & Acts", () => {
  const adminEmail = "admin@admin.com";
  const adminPassword = "admin123";

  const dentisteA = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "dentisteA@cypress.com",
    password: "password123",
    siret: "12345678901234",
    role: "DENTISTE"
  };

  const prothesisteA = {
    firstName: "Paul",
    lastName: "Martin",
    email: "prothesisteA@cypress.com",
    password: "password123",
    siret: "23456789012345",
    role: "PROTHESISTE"
  };

  const dentisteB = {
    firstName: "Alice",
    lastName: "Durand",
    email: "dentisteB@cypress.com",
    password: "password123",
    siret: "34567890123456",
    role: "DENTISTE"
  };

  const acts = [
    { name: "Acte 1", description: "Description 1" },
    { name: "Acte 2", description: "Description 2" },
    { name: "Acte 3", description: "Description 3" },
    { name: "Acte 4", description: "Description 4" },
    { name: "Acte 5", description: "Description 5" },
    { name: "Acte 6", description: "Description 6" },
  ];

  before(() => {
    // Login admin
    cy.visit("/login.html");
    cy.get("#email").type(adminEmail);
    cy.get("#password").type(adminPassword);
    cy.get("#submitButton").click();
    cy.url().should("include", "adminDashboard.html");
  });

  it("Créer un dentiste A", () => {
    cy.get("#addUserBtn").click();
    cy.get("#addUserForm input[name='firstName']").type(dentisteA.firstName);
    cy.get("#addUserForm input[name='lastName']").type(dentisteA.lastName);
    cy.get("#addUserForm input[name='email']").type(dentisteA.email);
    cy.get("#addUserForm input[name='password']").type(dentisteA.password);
    cy.get("#addUserForm input[name='siret']").type(dentisteA.siret);
    cy.get("#addUserForm select[name='role']").select(dentisteA.role);
    cy.get("#addUserForm button[type='submit']").click();
    cy.get("#addUserMessage").should("contain.text", "Utilisateur créé avec succès");
  });

  it("Créer un prothésiste lié au dentiste A", () => {
    cy.get("#addUserBtn").click();
    cy.get("#addUserForm input[name='firstName']").type(prothesisteA.firstName);
    cy.get("#addUserForm input[name='lastName']").type(prothesisteA.lastName);
    cy.get("#addUserForm input[name='email']").type(prothesisteA.email);
    cy.get("#addUserForm input[name='password']").type(prothesisteA.password);
    cy.get("#addUserForm input[name='siret']").type(prothesisteA.siret);
    cy.get("#addUserForm select[name='role']").select(prothesisteA.role);
    cy.get("#dentisteSelect").should("be.visible").select(dentisteA.firstName + " " + dentisteA.lastName);
    cy.get("#addUserForm button[type='submit']").click();
    cy.get("#addUserMessage").should("contain.text", "Utilisateur créé avec succès");
  });

  it("Créer et modifier un dentiste B", () => {
    // Création
    cy.get("#addUserBtn").click();
    cy.get("#addUserForm input[name='firstName']").type(dentisteB.firstName);
    cy.get("#addUserForm input[name='lastName']").type(dentisteB.lastName);
    cy.get("#addUserForm input[name='email']").type(dentisteB.email);
    cy.get("#addUserForm input[name='password']").type(dentisteB.password);
    cy.get("#addUserForm input[name='siret']").type(dentisteB.siret);
    cy.get("#addUserForm select[name='role']").select(dentisteB.role);
    cy.get("#addUserForm button[type='submit']").click();
    cy.get("#addUserMessage").should("contain.text", "Utilisateur créé avec succès");

    // Modification
    cy.contains(dentisteB.email).parent("tr").find(".btn-edit").click();
    cy.get("#editUserForm input[name='firstName']").clear().type("AliceMod");
    cy.get("#editUserForm button[type='submit']").click();
    cy.get("#editUserMessage").should("contain.text", "Utilisateur modifié avec succès");
  });

  it("Supprimer le dentiste B", () => {
    cy.contains("AliceMod").parent("tr").find(".btn-delete").click();
    cy.on("window:confirm", () => true);
    cy.get("#userMessage").should("contain.text", "Utilisateur supprimé avec succès");
  });

  it("Configurer les actes: créer 6 actes, modifier et supprimer le 6ème", () => {
    cy.get("#manageActesBtn").click();
    cy.url().should("include", "actManage.html");

    acts.forEach(act => {
      cy.get("#addActBtn").click();
      cy.get("#addActForm input[name='name']").type(act.name);
      cy.get("#addActForm input[name='description']").type(act.description);
      cy.get("#addActForm button[type='submit']").click();
    });

    // Modifier le 6ème
    cy.contains("Acte 6").parent("tr").find(".btn-edit").click();
    cy.get("#editActForm input[name='name']").clear().type("Acte 6 modifié");
    cy.get("#editActForm button[type='submit']").click();

    // Supprimer le 6ème
    cy.contains("Acte 6 modifié").parent("tr").find(".btn-delete").click();
    cy.on("window:confirm", () => true);
  });

  it("Retour à dashboard et vérifier", () => {
    cy.get("#returnBtn").click();
    cy.url().should("include", "adminDashboard.html");
  });

  it("Déconnexion", () => {
    cy.get("#logoutBtn").click();
    cy.url().should("include", "login.html");
  });
});
