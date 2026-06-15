/** Comptes E2E — l'admin est créé via API avant les tests (registerAdmin). */
export const ADMIN = {
  email: "admin@cypress.com",
  password: "Admin123456",
};

export const DENTISTE_A = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "dentisteA@cypress.com",
  password: "password123",
  siret: "12345678901234",
  role: "DENTISTE",
};

export const PROTHESISTE_A = {
  firstName: "Paul",
  lastName: "Martin",
  email: "prothesisteA@cypress.com",
  password: "password123",
  siret: "23456789012345",
  role: "PROTHESISTE",
};

export const DENTISTE_B = {
  firstName: "Alice",
  lastName: "Durand",
  email: "dentisteB@cypress.com",
  password: "password123",
  siret: "34567890123456",
  role: "DENTISTE",
};
