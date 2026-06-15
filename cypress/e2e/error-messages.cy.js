// Prérequis : npm start + MySQL actifs, comptes admin + actes (cf. admin-users.cy.js)
describe("Messages d'erreur — connexion", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("affiche une erreur si les champs sont vides", () => {
    cy.get("#submitButton").click();
    cy.expectFormError("messageLogin", "Tous les champs sont obligatoires");
  });

  it("affiche une erreur si l'email est invalide", () => {
    cy.get("#email").type("pas-un-email");
    cy.get("#password").type("123456789");
    cy.get("#submitButton").click();
    cy.expectFormError("messageLogin", "Format email invalide");
  });
});

// Prérequis : npm start + MySQL · lancer admin-users.cy.js avant (ou npx cypress run complet)
describe("Messages d'erreur — administrateur", () => {
  beforeEach(() => {
    cy.ensureAdmin();
  });

  it("affiche une erreur si le formulaire utilisateur est incomplet", () => {
    cy.get("#addUserBtn").click();
    cy.get("#addUserForm button[type='submit']").click();
    cy.expectFormError("addUserMessage", "Veuillez compléter les champs obligatoires");
  });
});

describe("Messages d'erreur — actes admin", () => {
  beforeEach(() => {
    cy.ensureAdmin();
    cy.get("#manageActesBtn").click();
    cy.url().should("include", "actManage.html");
  });

  it("affiche une erreur si l'acte existe déjà", () => {
    cy.get("#addActBtn").click();
    cy.get("#addActForm input[name='name']").type("Acte 1");
    cy.get("#addActForm input[name='description']").type("Doublon");
    cy.get("#addActForm button[type='submit']").click();
    cy.expectToastError("Erreur création acte");
  });
});
