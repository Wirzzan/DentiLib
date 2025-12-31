const User = require("../models/user.model");
const Acte = require("../models/act.model");
const WorkSheet = require('../models/workSheet.model');

//===========================================
//-------- Accueil prothésiste -----------------
const getAllProtoWorkSheets = async (req, res) => {
  try {
    const prothesisteId = req.user.id;

    const workSheets = await WorkSheet.find({ idProthesiste: prothesisteId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ workSheets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer une fiche par ID (sécurité : seulement si elle appartient au prothésiste)
const getProtoWorkSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const prothesisteId = req.user.id;

    const workSheet = await WorkSheet.findById(id);
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (workSheet.idProthesiste.toString() !== prothesisteId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    return res.status(200).json({ workSheet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateProtoSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, proDateLivraison, proDatePaiement } = req.body;

    const worksheet = await WorkSheet.findById(id);
    if (!worksheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (worksheet.idProthesiste.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    worksheet.status = status;
    worksheet.proDateLivraison = proDateLivraison;
    worksheet.proDatePaiement = proDatePaiement;

    await worksheet.save();
    res.json({ message: "Mise à jour section prothésiste effectuée", worksheet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



//=====================================
//------ Page gérer mes actes ---------- 
const getAllAdminActs = async (req, res) => {
  const acts = await Acte.find().sort({ name: 1 });
  res.json({ acts });
};

const getMyActs = async (req, res) => {
  const user = await User.findById(req.user.id).populate("listActs.acte");
  res.json({ acts: user.listActs });
};


const addActToProthesiste = async (req, res) => {
  try {
    const { acteId, price } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Prothésiste introuvable" });

    const exists = user.listActs.find(a => a.acte.toString() === acteId);
    if (exists) return res.status(400).json({ message: "Acte déjà ajouté" });

    user.listActs.push({ acte: acteId, price });
    await user.save();

    await user.populate("listActs.acte");

    res.json({ message: "Acte ajouté", listActs: user.listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'acte" });
  }
};


const updateActPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const { actId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Prothésiste introuvable" });

    const act = user.listActs.find(a => a.acte.toString() === actId);
    if (!act) return res.status(404).json({ message: "Acte introuvable" });

    act.price = price;
    await user.save();

    res.json({ message: "Prix mis à jour", listActs: user.listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
};



const deleteAct = async (req, res) => {
  try {
    const { actId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Prothésiste introuvable" });

    user.listActs = user.listActs.filter(a => a.acte.toString() !== actId);
    await user.save();

    res.json({ message: "Acte supprimé", listActs: user.listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};


module.exports = {  getAllProtoWorkSheets, getProtoWorkSheetById, updateProtoSection, getAllAdminActs, getMyActs, addActToProthesiste, updateActPrice, deleteAct};
