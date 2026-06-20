// Prérequis : admin-users.cy.js exécuté avant
import { DENTISTE_A, PROTHESISTE_A } from "../support/constants";

describe("Parcours prothésiste — suivi et actes", () => {
  const prothesiste = {
    email: PROTHESISTE_A.email,
    password: PROTHESISTE_A.password,
  };

  const dentiste = {
    email: DENTISTE_A.email,
    password: DENTISTE_A.password,
  };

  before(() => {
    // Prépare une fiche envoyée via l'API (sans code applicatif supplémentaire)
    cy.request("POST", "/api/user/login", {
      email: dentiste.email,
      password: dentiste.password,
    }).then(({ body }) => {
      const token = body.token;
      cy.request({
        method: "POST",
        url: "/dentiste/worksheets/create",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          nomPatient: "Proto",
          prenomPatient: "TestE2E",
          emailPatient: "proto.e2e@test.fr",
        },
      }).then((createRes) => {
        const ficheId = createRes.body.workSheet._id;
        cy.request({
          method: "PUT",
          url: `/dentiste/worksheets/send/${ficheId}`,
          headers: { Authorization: `Bearer ${token}` },
        });
      });
    });
  });

  beforeEach(() => {
    cy.login(prothesiste.email, prothesiste.password);
    cy.url().should("include", "prothesistHome.html");
  });

  it("affiche la fiche reçue du dentiste", () => {
    cy.get("#worksheetTable").should("contain.text", "Proto TestE2E");
    cy.get("#worksheetTable").should("contain.text", "En attente");
  });

  it("met à jour le statut d'une fiche", () => {
    cy.contains("Proto TestE2E").parents("tr").find(".btn-edit").click();
    cy.url().should("include", "dentistWorksheet.html");

    cy.get("#editProSectionBtn").click();
    cy.get("#pro-status").should("not.be.disabled").select("EN_COURS");
    cy.get("#pro-date-livraison").type("2026-06-20");
    cy.get("#saveProSectionBtn").click();

    cy.get("#uiToast").should("contain.text", "Section prothésiste mise à jour");
    cy.get("#pro-status").should("have.value", "EN_COURS");
  });

  it("refuse la connexion avec un mauvais mot de passe", () => {
    cy.get("#logoutBtn").click();
    cy.login(prothesiste.email, "mauvais_mdp");
    cy.get("#messageLogin").should("contain.text", "Mot de passe incorrect");
  });

  it("accède à la gestion des actes", () => {
    cy.get("#manageActesBtn").click();
    cy.url().should("include", "prothesistActs.html");
    cy.get("#addActBtn").click();
    cy.get(".act-select").last().select(1);
    cy.get(".priceInput").last().clear().type("120");
    cy.get("#returnBtn").click();
    cy.url().should("include", "prothesistHome.html");
  });
});
