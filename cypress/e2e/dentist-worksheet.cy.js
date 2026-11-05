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

// Compte distinct, sans association : ne pas modifier le dentiste A des autres parcours.
describe("Parcours dentiste — absence de prothésiste", () => {
  let adminToken;
  let accountId;
  const account = {
    firstName: "SansProthese",
    lastName: "Cypress",
    email: `sans-prothese-${Date.now()}@example.test`,
    password: "TestCypress123!",
    role: "DENTISTE",
  };

  before(() => {
    cy.ensureAdmin();
    cy.window().then((win) => {
      adminToken = win.localStorage.getItem("token");
      return cy.request({
        method: "POST",
        url: "/admin/user/createAccount",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: account,
      });
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.user.associatedUserId).to.eq(null);
      accountId = res.body.user._id;
    });
  });

  after(() => {
    if (!accountId) return;
    // Supprime uniquement ce compte et sa fiche de préparation.
    cy.request({
      method: "DELETE",
      url: `/admin/user/deleteAccount/${accountId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
    }).its("status").should("eq", 200);
  });

  it("empêche l’envoi sans prothésiste et conserve le brouillon", () => {
    cy.login(account.email, account.password);
    cy.url().should("include", "dentistHome.html");
    cy.openWorkFormModal();
    cy.get("#workForm input[name='nomPatient']").type("Fictif");
    cy.get("#workForm input[name='prenomPatient']").type("SansProthese");
    cy.get("#workForm input[name='emailPatient']").type("patient@example.test");
    cy.get("#workForm button[type='submit']").click();
    cy.url().should("include", "dentistWorksheet.html");

    cy.get("#envoyerFicheBtn")
      .should("be.visible")
      .and("be.disabled")
      .and("have.attr", "title",
        "Impossible d'envoyer cette fiche : aucun prothésiste n'est associé à votre compte.");
    cy.get("#noProthesisteMsg")
      .should("be.visible")
      .and("contain.text", "Aucun prothésiste n'est associé à votre compte.");
    cy.intercept("GET", /\/dentiste\/worksheets\/\d+(?:\?.*)?$/).as("readDraft");
    cy.reload();
    cy.wait("@readDraft").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body.workSheet.status).to.eq("BROUILLON");
      expect(response.body.workSheet.idProthesiste).to.eq(null);
    });
    cy.get("#envoyerFicheBtn").should("be.disabled");
  });
});
