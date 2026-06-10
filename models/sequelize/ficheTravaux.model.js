const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FicheTravaux = sequelize.define(
    "FicheTravaux",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      numFiche: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      remarque: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "BROUILLON",
          "EN_ATTENTE",
          "EN_COURS",
          "TERMINE",
          "EN_ATTENTE_PAIEMENT",
          "PAYE"
        ),
        allowNull: false,
        defaultValue: "BROUILLON",
      },
      nomPatient: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      prenomPatient: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      emailPatient: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      numSecuPatient: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      facturePDF: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prothesisteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      proDateLivraison: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      proDatePaiement: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "fiches_travaux",
    }
  );

  return FicheTravaux;
};
