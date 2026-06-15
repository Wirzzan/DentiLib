import { ADMIN } from "./constants";

Cypress.Commands.add("login", (email, password) => {
  cy.visit("/");
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password);
  cy.get("#submitButton").click();
});

/** Crée l'admin via API s'il n'existe pas, puis ouvre le dashboard. */
Cypress.Commands.add("ensureAdmin", () => {
  cy.request({
    method: "POST",
    url: "/api/user/registerAdmin",
    body: {
      email: ADMIN.email,
      firstName: "Admin",
      lastName: "Cypress",
      password: ADMIN.password,
    },
    failOnStatusCode: false,
  });

  cy.login(ADMIN.email, ADMIN.password);
  cy.url().should("include", "adminDashboard.html");
});

Cypress.Commands.add("closeAddUserModal", () => {
  cy.get("#userModal .close").click();
  cy.get("#userModal").should("not.be.visible");
});

Cypress.Commands.add("expectLoginPage", () => {
  cy.location("pathname").should("eq", "/");
});

Cypress.Commands.add("openWorkFormModal", () => {
  cy.get("#addWorkBtn").should("be.visible").click();
  cy.get("#workModal").should("be.visible");
  cy.get("#workForm").should("be.visible");
});

Cypress.Commands.add("closeWorkFormModal", () => {
  cy.get("#workModal .close").click();
  cy.get("#workModal").should("not.be.visible");
});

Cypress.Commands.add("confirmModal", () => {
  cy.get("#confirmModalOk").click();
});

Cypress.Commands.add("expectFormError", (elementId, text) => {
  cy.get(`#${elementId}`).should("be.visible").and("contain.text", text);
});

Cypress.Commands.add("expectToastError", (text) => {
  cy.get("#uiToast.ui-toast--error.is-visible").should("contain.text", text);
});
