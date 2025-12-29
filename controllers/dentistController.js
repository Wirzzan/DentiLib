const WorkSheet = require('../models/workSheet.model');
const User = require("../models/user.model");

const createWorkSheet = async (req, res) => {
  try {
    const { nomPatient, prenomPatient, emailPatient, numSecuPatient, remarque } = req.body;

    if (!nomPatient || !prenomPatient || !emailPatient) {
      return res.status(400).json({ message: "Nom, prénom et email du patient sont obligatoires" });
    }

    // Générer un numéro de fiche unique simple
    const lastWorkSheet = await WorkSheet.findOne().sort({ numFiche: -1 });
    const numFiche = lastWorkSheet ? lastWorkSheet.numFiche + 1 : 1;

    const workSheet = await WorkSheet.create({
      numFiche,
      nomPatient,
      prenomPatient,
      emailPatient,
      numSecuPatient,
      acts: [],
      remarque,
      idUser: req.user.id // dentiste connecté
      //associatedUser.id
    });

    return res.status(201).json({ message: "Fiche travaux créée", workSheet });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getAllWorkSheets = async (req, res) => {
  try {
    const workSheets = await WorkSheet.find({ idUser: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({ workSheets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const getWorkSheetById = async (req, res) => {
  try {
    const { id } = req.params;

    const workSheet = await WorkSheet.findById(id);
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    // Vérification : le dentiste peut voir seulement ses fiches
    if (workSheet.idUser.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    return res.status(200).json({ workSheet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateWorkSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workSheet = await WorkSheet.findById(id);
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    // Vérif : le dentiste peut modifier que ses fiches
    if (workSheet.idUser.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    Object.assign(workSheet, updates); // met à jour les champs reçus
    await workSheet.save();

    return res.status(200).json({ message: "Fiche mise à jour", workSheet });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteWorkSheet = async (req, res) => {
  try {
    const { id } = req.params;

    const workSheet = await WorkSheet.findById(id);
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (workSheet.idUser.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await WorkSheet.findByIdAndDelete(id);

    return res.status(200).json({ message: "Fiche supprimée" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const sendWorkSheet = async (req, res) => {
  try {
    const worksheetId = req.params.id;

    // Récupérer la fiche
    const worksheet = await WorkSheet.findById(worksheetId);
    if (!worksheet) return res.status(404).json({ message: "❌ Envoi impossible : Fiche introuvable" });

    // Sécurité : vérifier que c’est bien le dentiste créateur
    if (worksheet.idUser.toString() !== req.user.id) {
      return res.status(403).json({ message: "❌ Envoi impossible : Accès refusé" });
    }

    // Recharger le dentiste depuis la DB
    const dentiste = await User.findById(req.user.id);
    if (!dentiste || !dentiste.associatedUser) {
      return res.status(400).json({ message: "❌ Envoi impossible : Pas de prothésiste associé" });
    }

    // Empêcher double envoi
    if (worksheet.idProthesiste) {
      return res.status(400).json({ message: "❌ Envoi impossible : Fiche déjà envoyée" });
    }

    worksheet.idProthesiste = dentiste.associatedUser;
    worksheet.status = "EN_ATTENTE";

    await worksheet.save();

    res.json({
      message: "Fiche envoyée au prothésiste",
      worksheet
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi de la fiche" });
  }
};

module.exports = { createWorkSheet, getAllWorkSheets, getWorkSheetById, updateWorkSheet, deleteWorkSheet, sendWorkSheet };

