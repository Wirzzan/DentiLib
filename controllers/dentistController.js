const {
  Utilisateur,
  ActeProthesiste,
  Acte,
  FicheTravaux,
  ActeFiche,
  sequelize,
} = require("../models");
const { formatWorkSheet, userId } = require("../utils/sequelizeHelpers");

const workSheetInclude = [{ model: ActeFiche, as: "acts" }];

const FICHE_FIELDS = [
  "nomPatient",
  "prenomPatient",
  "emailPatient",
  "numSecuPatient",
  "remarque",
  "status",
  "facturePDF",
  "proDateLivraison",
  "proDatePaiement",
];

const syncFicheActs = async (ficheId, acts, transaction) => {
  await ActeFiche.destroy({ where: { ficheId }, transaction });

  if (!acts || acts.length === 0) return;

  await ActeFiche.bulkCreate(
    acts.map((a) => ({
      ficheId,
      acteId: Number(a.acteId),
      name: a.name,
      description: a.description,
      price: a.price,
    })),
    { transaction }
  );
};

const createWorkSheet = async (req, res) => {
  try {
    const { nomPatient, prenomPatient, emailPatient, numSecuPatient, remarque } = req.body;

    if (!nomPatient || !prenomPatient || !emailPatient) {
      return res.status(400).json({
        message: "Nom, prénom et email du patient sont obligatoires",
      });
    }

    const lastWorkSheet = await FicheTravaux.findOne({
      order: [["numFiche", "DESC"]],
    });
    const numFiche = lastWorkSheet ? lastWorkSheet.numFiche + 1 : 1;

    const workSheet = await FicheTravaux.create({
      numFiche,
      nomPatient,
      prenomPatient,
      emailPatient,
      numSecuPatient,
      remarque,
      utilisateurId: userId(req.user.id),
      status: "BROUILLON",
    });

    const withActs = await FicheTravaux.findByPk(workSheet.id, { include: workSheetInclude });

    return res.status(201).json({
      message: "Fiche travaux créée",
      workSheet: formatWorkSheet(withActs),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getAllWorkSheets = async (req, res) => {
  try {
    const workSheets = await FicheTravaux.findAll({
      where: { utilisateurId: userId(req.user.id) },
      include: workSheetInclude,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ workSheets: workSheets.map(formatWorkSheet) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const getWorkSheetById = async (req, res) => {
  try {
    const { id } = req.params;

    const workSheet = await FicheTravaux.findByPk(id, { include: workSheetInclude });
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (workSheet.utilisateurId !== userId(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    return res.status(200).json({ workSheet: formatWorkSheet(workSheet) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateWorkSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    const acts = updates.acts;

    delete updates.acts;
    delete updates._id;
    delete updates.idUser;
    delete updates.idProthesiste;

    const workSheet = await FicheTravaux.findByPk(id, { include: workSheetInclude });
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (workSheet.utilisateurId !== userId(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await sequelize.transaction(async (t) => {
      FICHE_FIELDS.forEach((field) => {
        if (updates[field] !== undefined) {
          workSheet[field] = updates[field];
        }
      });

      await workSheet.save({ transaction: t });

      if (acts !== undefined) {
        await syncFicheActs(workSheet.id, acts, t);
      }
    });

    await workSheet.reload({ include: workSheetInclude });

    return res.status(200).json({
      message: "Fiche mise à jour",
      workSheet: formatWorkSheet(workSheet),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteWorkSheet = async (req, res) => {
  try {
    const { id } = req.params;

    const workSheet = await FicheTravaux.findByPk(id);
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (workSheet.utilisateurId !== userId(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await sequelize.transaction(async (t) => {
      await ActeFiche.destroy({ where: { ficheId: id }, transaction: t });
      await workSheet.destroy({ transaction: t });
    });

    return res.status(200).json({ message: "Fiche supprimée" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const getProthesisteActs = async (req, res) => {
  try {
    const dentiste = await Utilisateur.findByPk(userId(req.user.id));
    if (!dentiste || dentiste.role !== "DENTISTE") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!dentiste.associatedUserId) {
      return res.json({ acts: [] });
    }

    const rows = await ActeProthesiste.findAll({
      where: { utilisateurId: dentiste.associatedUserId },
      include: [{ model: Acte, as: "acte" }],
    });

    const acts = rows.map((row) => {
      const plain = row.get({ plain: true });
      const acte = plain.acte;
      return {
        acteId: acte?.id || plain.acteId,
        name: acte?.name || "",
        description: acte?.description || "",
        price: plain.price != null ? parseFloat(plain.price) : 0,
      };
    });

    return res.json({ acts });
  } catch (error) {
    console.error("❌ Erreur getProthesisteActs :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des actes du prothésiste",
    });
  }
};

const sendWorkSheet = async (req, res) => {
  try {
    const worksheetId = req.params.id;

    const worksheet = await FicheTravaux.findByPk(worksheetId, { include: workSheetInclude });
    if (!worksheet) {
      return res.status(404).json({ message: "❌ Envoi impossible : Fiche introuvable" });
    }

    if (worksheet.utilisateurId !== userId(req.user.id)) {
      return res.status(403).json({ message: "❌ Envoi impossible : Accès refusé" });
    }

    const dentiste = await Utilisateur.findByPk(userId(req.user.id));
    if (!dentiste || !dentiste.associatedUserId) {
      return res.status(400).json({ message: "❌ Envoi impossible : Pas de prothésiste associé" });
    }

    if (worksheet.prothesisteId) {
      return res.status(400).json({ message: "❌ Envoi impossible : Fiche déjà envoyée" });
    }

    worksheet.prothesisteId = dentiste.associatedUserId;
    worksheet.status = "EN_ATTENTE";
    await worksheet.save();

    res.json({
      message: "Fiche envoyée au prothésiste",
      worksheet: formatWorkSheet(worksheet),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi de la fiche" });
  }
};

module.exports = {
  createWorkSheet,
  getAllWorkSheets,
  getWorkSheetById,
  getProthesisteActs,
  updateWorkSheet,
  deleteWorkSheet,
  sendWorkSheet,
};
