// Prérequis : admin-users.cy.js exécuté avant (crée dentisteA + prothesisteA)
import { DENTISTE_A } from "../support/constants";

// testIsolation: false → enchaînement création fiche → retour accueil → déconnexion
describe("Parcours dentiste — fiches de travaux", { testIsolation: false }, () => {
  const dentiste = {
    email: DENTISTE_A.email,
    password: DENTISTE_A.password,
  };

  const patient = {
    nom: "Lefevre",
    prenom: "Cypress",
    email: "cypress.lefevre@test.fr",
  };

  before(() => {
    cy.login(dentiste.email, dentiste.password);
    cy.url().should("include", "dentistHome.html");
  });

  it("refuse une fiche avec champs obligatoires vides", () => {
    cy.openWorkFormModal();
    cy.get("#workForm button[type='submit']").click();
    cy.get("#workFormMessage")
      .should("be.visible")
      .and("contain.text", "Veuillez compléter les champs obligatoires");
    cy.closeWorkFormModal();
  });

  it("refuse un email patient invalide", () => {
    cy.openWorkFormModal();
    cy.get("#workForm input[name='nomPatient']").type(patient.nom);
    cy.get("#workForm input[name='prenomPatient']").type(patient.prenom);
    cy.get("#workForm input[name='emailPatient']").type("email-invalide");
    cy.get("#workForm button[type='submit']").click();
    cy.get("#workFormMessage")
      .should("be.visible")
      .and("contain.text", "Format email invalide");
    cy.closeWorkFormModal();
  });

  it("crée une fiche et l'envoie au prothésiste", () => {
    cy.openWorkFormModal();
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
    cy.visit("/dentistHome.html");
    cy.get("#worksheetTable").should("contain.text", `${patient.nom} ${patient.prenom}`);
    cy.get("#logoutBtn").click();
    cy.expectLoginPage();
  });
});
