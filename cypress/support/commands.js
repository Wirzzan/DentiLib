Cypress.Commands.add("login", (email, password) => {
  cy.visit("/");
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password);
  cy.get("#submitButton").click();
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
