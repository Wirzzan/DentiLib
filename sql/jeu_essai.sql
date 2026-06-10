-- DentiLib — Jeu d'essai (données de test)
-- Mot de passe de tous les comptes : 123456789
-- Exécuter après create_tables.sql

USE dentilib;

-- Hash bcrypt de "123456789" (coût 10)
SET @pwd = '$2b$10$Bct1K/luTTslxjAF7BdnuuxQYcfvgxWtqkPjYSpo4Y/ew1eNpmNE6';

-- Utilisateurs
INSERT INTO utilisateurs (first_name, last_name, email, password, role, siret, associated_user_id) VALUES
('Admin', 'Dentilib', 'admin@dentilib.fr', @pwd, 'ADMIN', NULL, NULL),
('Marie', 'Martin', 'marie.martin@dentiste.fr', @pwd, 'DENTISTE', '12345678901234', NULL),
('Paul', 'Durand', 'paul.durand@prothese.fr', @pwd, 'PROTHESISTE', '98765432109876', NULL);

-- Association dentiste (id=2) <-> prothésiste (id=3)
UPDATE utilisateurs SET associated_user_id = 3 WHERE id = 2;
UPDATE utilisateurs SET associated_user_id = 2 WHERE id = 3;

-- Catalogue actes
INSERT INTO actes (name, description) VALUES
('Couronne céramique', 'Couronne dentaire en céramique'),
('Bridge 3 éléments', 'Bridge fixe sur 3 dents'),
('Prothèse amovible', 'Prothèse partielle amovible'),
('Inlay-core', 'Reconstruction coronaire');

-- Tarifs prothésiste (Paul, id=3)
INSERT INTO actes_prothesiste (utilisateur_id, acte_id, price) VALUES
(3, 1, 350.00),
(3, 2, 890.00),
(3, 3, 420.00),
(3, 4, 180.00);

-- Fiche de travaux n°1 (brouillon, dentiste Marie)
INSERT INTO fiches_travaux (
  num_fiche, remarque, status,
  nom_patient, prenom_patient, email_patient, num_secu_patient,
  utilisateur_id, prothesiste_id
) VALUES (
  1, 'Teinte A2', 'BROUILLON',
  'Dupont', 'Jean', 'jean.dupont@email.fr', '1234567890123',
  2, NULL
);

-- Fiche de travaux n°2 (envoyée au prothésiste)
INSERT INTO fiches_travaux (
  num_fiche, remarque, status,
  nom_patient, prenom_patient, email_patient, num_secu_patient,
  utilisateur_id, prothesiste_id
) VALUES (
  2, 'Urgent', 'EN_ATTENTE',
  'Bernard', 'Sophie', 'sophie.bernard@email.fr', '9876543210987',
  2, 3
);

-- Lignes d'actes sur la fiche 1
INSERT INTO actes_fiche (fiche_id, acte_id, name, description, price) VALUES
(1, 1, 'Couronne céramique', 'Couronne dentaire en céramique', 350.00);

-- Lignes d'actes sur la fiche 2
INSERT INTO actes_fiche (fiche_id, acte_id, name, description, price) VALUES
(2, 2, 'Bridge 3 éléments', 'Bridge fixe sur 3 dents', 890.00),
(2, 4, 'Inlay-core', 'Reconstruction coronaire', 180.00);
