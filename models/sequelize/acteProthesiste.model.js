const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ActeProthesiste = sequelize.define(
    "ActeProthesiste",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      acteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      tableName: "actes_prothesiste",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["utilisateurId", "acteId"],
        },
      ],
    }
  );

  return ActeProthesiste;
};
