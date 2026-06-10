const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Acte = sequelize.define(
    "Acte",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "actes",
      timestamps: false,
    }
  );

  return Acte;
};
