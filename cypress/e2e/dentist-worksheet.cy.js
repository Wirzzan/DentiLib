// Prérequis : npm start + MySQL actifs, comptes dentisteA / prothesisteA créés (cf. admin-users.cy.js)
describe("Parcours dentiste — fiches de travaux", () => {
  const dentiste = {
    email: "dentisteA@cypress.com",
    password: "password123",
  };

  const patient = {
    nom: "Lefevre",
    prenom: "Cypress",
    email: "cypress.lefevre@test.fr",
  };

  beforeEach(() => {
    cy.login(dentiste.email, dentiste.password);
    cy.url().should("include", "dentistHome.html");
  });

  it("refuse une fiche avec champs obligatoires vides", () => {
    cy.get("#addWorkBtn").click();
    cy.get("#workForm button[type='submit']").click();
    cy.get("#workFormMessage").should("contain.text", "Veuillez compléter les champs obligatoires");
  });

  it("refuse un email patient invalide", () => {
    cy.get("#addWorkBtn").click();
    cy.get("#workForm input[name='nomPatient']").type(patient.nom);
    cy.get("#workForm input[name='prenomPatient']").type(patient.prenom);
    cy.get("#workForm input[name='emailPatient']").type("email-invalide");
    cy.get("#workForm button[type='submit']").click();
    cy.get("#workFormMessage").should("contain.text", "Format email invalide");
  });

  it("crée une fiche et l'envoie au prothésiste", () => {
    cy.get("#addWorkBtn").click();
    cy.get("#workForm input[name='nomPatient']").type(patient.nom);
    cy.get("#workForm input[name='prenomPatient']").type(patient.prenom);
    cy.get("#workForm input[name='emailPatient']").type(patient.email);
    cy.get("#workForm button[type='submit']").click();

    cy.url().should("include", "dentistWorksheet.html");
    cy.get("#nomPatient").should("contain.text", patient.nom);
    cy.get("#prenomPatient").should("contain.text", patient.prenom);

    cy.get("#envoyerFicheBtn").should("be.visible").click();
    cy.confirmModal();

    cy.get("#uiToast").should("contain.text", "Fiche envoyée");
    cy.get("#envoyerFicheBtn").should("not.be.visible");
    cy.get("#pro-status").should("have.value", "EN_ATTENTE");
  });

  it("déconnexion", () => {
    cy.get("#logoutBtn").click();
    cy.url().should("include", "login.html");
  });
});
