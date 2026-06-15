// Exécuté en premier : vide la BDD avant les tests E2E (relance en boucle possible)
describe("Setup — reset BDD", () => {
  it("vide les tables de test", () => {
    cy.task("resetTestDatabase");
  });
});
