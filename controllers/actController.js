const { Acte } = require("../models");
const { formatActe } = require("../utils/sequelizeHelpers");

const getAllActes = async (req, res) => {
  try {
    const actes = await Acte.findAll({ order: [["name", "ASC"]] });
    return res.status(200).json({ actes: actes.map(formatActe) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const createActe = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Acte name is required" });
    }

    const existingActe = await Acte.findOne({ where: { name } });
    if (existingActe) {
      return res.status(409).json({ message: "Acte already exists" });
    }

    const acte = await Acte.create({ name, description });

    return res.status(201).json({
      message: "Acte created successfully",
      acte: formatActe(acte),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateActe = async (req, res) => {
  try {
    const { acteId } = req.params;
    const { name, description } = req.body;

    const acte = await Acte.findByPk(acteId);
    if (!acte) {
      return res.status(404).json({ message: "Acte not found" });
    }

    if (name) acte.name = name;
    if (description !== undefined) acte.description = description;

    await acte.save();

    return res.status(200).json({
      message: "Acte updated successfully",
      acte: formatActe(acte),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteActe = async (req, res) => {
  try {
    const { acteId } = req.params;

    const acte = await Acte.findByPk(acteId);
    if (!acte) {
      return res.status(404).json({ message: "Acte not found" });
    }

    await acte.destroy();

    return res.status(200).json({ message: "Acte deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllActes, createActe, updateActe, deleteActe };
