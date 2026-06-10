const { sequelize } = require("../config/sequelize");

const defineUtilisateur = require("./sequelize/utilisateur.model");
const defineActe = require("./sequelize/acte.model");
const defineActeProthesiste = require("./sequelize/acteProthesiste.model");
const defineFicheTravaux = require("./sequelize/ficheTravaux.model");
const defineActeFiche = require("./sequelize/acteFiche.model");

const Utilisateur = defineUtilisateur(sequelize);
const Acte = defineActe(sequelize);
const ActeProthesiste = defineActeProthesiste(sequelize);
const FicheTravaux = defineFicheTravaux(sequelize);
const ActeFiche = defineActeFiche(sequelize);

// Association dentiste <-> prothésiste (1-1 via associatedUserId)
Utilisateur.belongsTo(Utilisateur, {
  as: "associatedUser",
  foreignKey: "associatedUserId",
});
Utilisateur.hasOne(Utilisateur, {
  as: "associatedPartner",
  foreignKey: "associatedUserId",
});

// Catalogue prothésiste
Utilisateur.hasMany(ActeProthesiste, { foreignKey: "utilisateurId" });
ActeProthesiste.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

Acte.hasMany(ActeProthesiste, { foreignKey: "acteId" });
ActeProthesiste.belongsTo(Acte, { foreignKey: "acteId", as: "acte" });

// Fiches de travaux
Utilisateur.hasMany(FicheTravaux, {
  as: "fichesDentiste",
  foreignKey: "utilisateurId",
});
Utilisateur.hasMany(FicheTravaux, {
  as: "fichesProthesiste",
  foreignKey: "prothesisteId",
});
FicheTravaux.belongsTo(Utilisateur, {
  as: "dentiste",
  foreignKey: "utilisateurId",
});
FicheTravaux.belongsTo(Utilisateur, {
  as: "prothesiste",
  foreignKey: "prothesisteId",
});

FicheTravaux.hasMany(ActeFiche, { foreignKey: "ficheId", as: "acts" });
ActeFiche.belongsTo(FicheTravaux, { foreignKey: "ficheId" });

Acte.hasMany(ActeFiche, { foreignKey: "acteId" });
ActeFiche.belongsTo(Acte, { foreignKey: "acteId" });

module.exports = {
  sequelize,
  Utilisateur,
  Acte,
  ActeProthesiste,
  FicheTravaux,
  ActeFiche,
};
