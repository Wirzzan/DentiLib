const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define(
    "Utilisateur",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "DENTISTE", "PROTHESISTE"),
        allowNull: false,
      },
      siret: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      associatedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "utilisateurs",
    }
  );

  return Utilisateur;
};
