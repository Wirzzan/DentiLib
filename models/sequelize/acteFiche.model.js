const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ActeFiche = sequelize.define(
    "ActeFiche",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ficheId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      acteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "actes_fiche",
      timestamps: false,
    }
  );

  return ActeFiche;
};
