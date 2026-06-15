// Ordre : admin (crée comptes + actes) → dentiste → prothésiste → messages d'erreur
import { DENTISTE_A, PROTHESISTE_A, DENTISTE_B } from "../support/constants";

// testIsolation: false → les tests s'enchaînent sur la même session (obligatoire ici :
// connexion admin dans before(), puis navigation actManage → dashboard)
describe("Admin Flow: Users & Acts", { testIsolation: false }, () => {
  const acts = [
    { name: "Acte 1", description: "Description 1" },
    { name: "Acte 2", description: "Description 2" },
    { name: "Acte 3", description: "Description 3" },
    { name: "Acte 4", description: "Description 4" },
    { name: "Acte 5", description: "Description 5" },
    { name: "Acte 6", description: "Description 6" },
  ];

  before(() => {
    cy.ensureAdmin();
  });

  it("Créer un dentiste A", () => {
    cy.get("#userTableBody").then(($tbody) => {
      if ($tbody.text().includes(DENTISTE_A.email)) return;

      cy.get("#addUserBtn").click();
      cy.get("#addUserForm input[name='firstName']").type(DENTISTE_A.firstName);
      cy.get("#addUserForm input[name='lastName']").type(DENTISTE_A.lastName);
      cy.get("#addUserForm input[name='email']").type(DENTISTE_A.email);
      cy.get("#addUserForm input[name='password']").type(DENTISTE_A.password);
      cy.get("#addUserForm input[name='siret']").type(DENTISTE_A.siret);
      cy.get("#addUserForm select[name='role']").select(DENTISTE_A.role);
      cy.get("#addUserForm button[type='submit']").click();
      cy.get("#addUserMessage").should("contain.text", "Utilisateur créé avec succès");
      cy.closeAddUserModal();
    });
  });

  it("Créer un prothésiste lié au dentiste A", () => {
    cy.get("#userTableBody").then(($tbody) => {
      if ($tbody.text().includes(PROTHESISTE_A.email)) return;

      cy.get("#addUserBtn").click();
      cy.get("#addUserForm input[name='firstName']").type(PROTHESISTE_A.firstName);
      cy.get("#addUserForm input[name='lastName']").type(PROTHESISTE_A.lastName);
      cy.get("#addUserForm input[name='email']").type(PROTHESISTE_A.email);
      cy.get("#addUserForm input[name='password']").type(PROTHESISTE_A.password);
      cy.get("#addUserForm input[name='siret']").type(PROTHESISTE_A.siret);
      cy.get("#addUserForm select[name='role']").select(PROTHESISTE_A.role);
      cy.get("#dentisteSelect")
        .should("be.visible")
        .select(`${DENTISTE_A.firstName} ${DENTISTE_A.lastName}`);
      cy.get("#addUserForm button[type='submit']").click();
      cy.get("#addUserMessage").should("contain.text", "Utilisateur créé avec succès");
      cy.closeAddUserModal();
    });
  });

  it("Créer et modifier un dentiste B", () => {
    cy.get("#userTableBody").then(($tbody) => {
      if (!$tbody.text().includes(DENTISTE_B.email)) {
        cy.get("#addUserBtn").click();
        cy.get("#addUserForm input[name='firstName']").type(DENTISTE_B.firstName);
        cy.get("#addUserForm input[name='lastName']").type(DENTISTE_B.lastName);
        cy.get("#addUserForm input[name='email']").type(DENTISTE_B.email);
        cy.get("#addUserForm input[name='password']").type(DENTISTE_B.password);
        cy.get("#addUserForm input[name='siret']").type(DENTISTE_B.siret);
        cy.get("#addUserForm select[name='role']").select(DENTISTE_B.role);
        cy.get("#addUserForm button[type='submit']").click();
        cy.get("#addUserMessage").should("contain.text", "Utilisateur créé avec succès");
        cy.closeAddUserModal();
      }
    });

    cy.contains(DENTISTE_B.email).parents("tr").find(".btn-edit").click();
    cy.get("#editUserForm input[name='firstName']").clear().type("AliceMod");
    cy.get("#editUserForm button[type='submit']").click();
    cy.get("#editUserMessage").should("contain.text", "Utilisateur modifié avec succès");
    cy.closeEditUserModal();
  });

  it("Supprimer le dentiste B", () => {
    cy.contains("AliceMod").parents("tr").find(".btn-delete").click();
    cy.confirmModal();
    cy.get("#userMessage").should("contain.text", "Utilisateur supprimé avec succès");
  });

  it("Configurer les actes: créer 6 actes, modifier et supprimer le 6ème", () => {
    cy.get("#manageActesBtn").click();
    cy.url().should("include", "actManage.html");

    acts.forEach((act) => {
      cy.get("body").then(($body) => {
        if ($body.text().includes(act.name)) return;

        cy.get("#addActBtn").click();
        cy.get("#addActForm input[name='name']").type(act.name);
        cy.get("#addActForm input[name='description']").type(act.description);
        cy.get("#addActForm button[type='submit']").click();
      });
    });

    cy.contains("Acte 6").parents("tr").find(".btn-edit").click();
    cy.get("#editActForm input[name='name']").clear().type("Acte 6 modifié");
    cy.get("#editActForm button[type='submit']").click();

    cy.contains("Acte 6 modifié").parents("tr").find(".btn-delete").click();
    cy.confirmModal();
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
