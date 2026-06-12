-- DentiLib — Script de création MySQL
-- Base : dentilib

CREATE DATABASE IF NOT EXISTS dentilib
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dentilib;

-- Suppression (ordre inverse des dépendances)
DROP TABLE IF EXISTS actes_fiche;
DROP TABLE IF EXISTS fiches_travaux;
DROP TABLE IF EXISTS actes_prothesiste;
DROP TABLE IF EXISTS actes;
DROP TABLE IF EXISTS utilisateurs;

-- =============================================
-- Table utilisateurs
-- =============================================
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'DENTISTE', 'PROTHESISTE') NOT NULL,
  siret VARCHAR(14) NULL,
  associated_user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_utilisateur_associe
    FOREIGN KEY (associated_user_id) REFERENCES utilisateurs(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- =============================================
-- Table actes (catalogue admin)
-- =============================================
CREATE TABLE actes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL
);

-- =============================================
-- Table actes_prothesiste (tarifs par prothésiste)
-- =============================================
CREATE TABLE actes_prothesiste (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  acte_id INT NOT NULL,
  price DECIMAL(10, 2) NULL,
  CONSTRAINT fk_ap_utilisateur
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_ap_acte
    FOREIGN KEY (acte_id) REFERENCES actes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT uq_ap_utilisateur_acte UNIQUE (utilisateur_id, acte_id)
);

-- =============================================
-- Table fiches_travaux
-- =============================================
CREATE TABLE fiches_travaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  num_fiche INT NOT NULL UNIQUE,
  remarque TEXT NULL,
  status ENUM(
    'BROUILLON',
    'EN_ATTENTE',
    'EN_COURS',
    'TERMINE',
    'EN_ATTENTE_PAIEMENT',
    'PAYE'
  ) NOT NULL DEFAULT 'BROUILLON',
  nom_patient VARCHAR(100) NOT NULL,
  prenom_patient VARCHAR(100) NOT NULL,
  email_patient VARCHAR(255) NOT NULL,
  num_secu_patient VARCHAR(15) NULL,
  facture_pdf VARCHAR(500) NULL,
  utilisateur_id INT NOT NULL,
  prothesiste_id INT NULL,
  pro_date_livraison DATETIME NULL,
  pro_date_paiement DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fiche_dentiste
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_fiche_prothesiste
    FOREIGN KEY (prothesiste_id) REFERENCES utilisateurs(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- =============================================
-- Table actes_fiche (lignes d'actes sur une fiche)
-- =============================================
CREATE TABLE actes_fiche (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fiche_id INT NOT NULL,
  acte_id INT NOT NULL,
  name VARCHAR(255) NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_af_fiche
    FOREIGN KEY (fiche_id) REFERENCES fiches_travaux(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_af_acte
    FOREIGN KEY (acte_id) REFERENCES actes(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);
