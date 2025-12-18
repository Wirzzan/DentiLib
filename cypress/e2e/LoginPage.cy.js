describe('Login Page Dentilib', () => {
  
  beforeEach(() => {
    cy.visit("http://localhost:3000/")
  })
  
  //Tester l'affichage des éléments clés
  it("Afficher des éléments clés de la page login", () => {
    cy.get("#email").should("exist")
    cy.get("#password").should("exist")
    cy.get("#submitButton").should("exist")
    cy.get("#messageLogin").should("exist")
  })

  //Tester le formulaire vide
  it("Affichage d'une erreur lors du submit vide du formulaire", () => {

    cy.get("#submitButton").click()
    cy.get("#messageLogin").should("contain", "Tous les champs sont obligatoires")
  });

  //Tester le formulaire avec un mail invalide
  it("Affichege de l'erreur quand mail invalide", () => {
    cy.get("#email").type("email invalide");
    cy.get("#password").type("1123456789");
    cy.get("#submitButton").click();
    cy.get("#messageLogin").should("contain", "Email format invalide");
  });

  //Tester le mot de passe < 6 caractères
  it("Afficher le bon message d'erreur quand le mdp < 6 caractères", () => {
    cy.get("#email").type("valide@gmail.com")
    cy.get("#password").type("123")
    cy.get("#submitButton").click()
    cy.get("#messageLogin").should("contain", "Le mot de passe doit dépasser 6 caractères")
  })

  it("Tester l'envoi d'une requêtes qui retourne faux", () => {
    cy.intercept("POST", "/api/user/login", {
      statusCode : 404,
      body:{
        message : "Email ou mot de passe incorrect"
      }
    }).as("loginRequest")

    cy.get("#email").type("email invalide");
    cy.get("#password").type("1123456789");
    cy.get("#submitButton").click();

    cy.wait("@loginRequest");
    cy.get("#messageLogin").should(
      "contain", "Email ou mot de passe incorrect"
    );
  })

  it("Tester la redirection après le login", () => {
     cy.intercept("POST", "/api/user/login", {
      statusCode : 201,
      body:{
        role : "ADMIN"
      }
    }).as("loginRequest")

    cy.get("#email").type("admin@admin.com");
    cy.get("#password").type("admin123");
    cy.get("#submitButton").click();

    cy.url().should("include", "admin.html")
  })
})