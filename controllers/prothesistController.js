const {
  Utilisateur,
  Acte,
  ActeProthesiste,
  FicheTravaux,
  ActeFiche,
} = require("../models");
const {
  formatActe,
  formatListAct,
  formatWorkSheet,
  userId,
} = require("../utils/sequelizeHelpers");

const workSheetInclude = [{ model: ActeFiche, as: "acts" }];

const getAllProtoWorkSheets = async (req, res) => {
  try {
    const prothesisteId = userId(req.user.id);

    const workSheets = await FicheTravaux.findAll({
      where: { prothesisteId },
      include: workSheetInclude,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ workSheets: workSheets.map(formatWorkSheet) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const getProtoWorkSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const prothesisteId = userId(req.user.id);

    const workSheet = await FicheTravaux.findByPk(id, { include: workSheetInclude });
    if (!workSheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (workSheet.prothesisteId !== prothesisteId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    return res.status(200).json({ workSheet: formatWorkSheet(workSheet) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateProtoSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, proDateLivraison, proDatePaiement } = req.body;

    const worksheet = await FicheTravaux.findByPk(id, { include: workSheetInclude });
    if (!worksheet) return res.status(404).json({ message: "Fiche introuvable" });

    if (worksheet.prothesisteId !== userId(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    worksheet.status = status;
    worksheet.proDateLivraison = proDateLivraison;
    worksheet.proDatePaiement = proDatePaiement;
    await worksheet.save();

    res.json({
      message: "Mise à jour section prothésiste effectuée",
      worksheet: formatWorkSheet(worksheet),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getAllAdminActs = async (req, res) => {
  try {
    const acts = await Acte.findAll({ order: [["name", "ASC"]] });
    res.json({ acts: acts.map(formatActe) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const fetchListActs = async (utilisateurId) => {
  const rows = await ActeProthesiste.findAll({
    where: { utilisateurId },
    include: [{ model: Acte, as: "acte" }],
  });
  return rows.map(formatListAct);
};

const getMyActs = async (req, res) => {
  try {
    const listActs = await fetchListActs(userId(req.user.id));
    res.json({ acts: listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const addActToProthesiste = async (req, res) => {
  try {
    const { acteId, price } = req.body;
    const utilisateurId = userId(req.user.id);

    const user = await Utilisateur.findByPk(utilisateurId);
    if (!user) return res.status(404).json({ message: "Prothésiste introuvable" });

    const exists = await ActeProthesiste.findOne({
      where: { utilisateurId, acteId },
    });
    if (exists) return res.status(400).json({ message: "Acte déjà ajouté" });

    await ActeProthesiste.create({ utilisateurId, acteId, price });
    const listActs = await fetchListActs(utilisateurId);

    res.json({ message: "Acte ajouté", listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'acte" });
  }
};

const updateActPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const { actId } = req.params;
    const utilisateurId = userId(req.user.id);

    const user = await Utilisateur.findByPk(utilisateurId);
    if (!user) return res.status(404).json({ message: "Prothésiste introuvable" });

    const act = await ActeProthesiste.findOne({
      where: { utilisateurId, acteId: actId },
    });
    if (!act) return res.status(404).json({ message: "Acte introuvable" });

    act.price = price;
    await act.save();

    const listActs = await fetchListActs(utilisateurId);
    res.json({ message: "Prix mis à jour", listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
};

const deleteAct = async (req, res) => {
  try {
    const { actId } = req.params;
    const utilisateurId = userId(req.user.id);

    const user = await Utilisateur.findByPk(utilisateurId);
    if (!user) return res.status(404).json({ message: "Prothésiste introuvable" });

    await ActeProthesiste.destroy({
      where: { utilisateurId, acteId: actId },
    });

    const listActs = await fetchListActs(utilisateurId);
    res.json({ message: "Acte supprimé", listActs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};

module.exports = {
  getAllProtoWorkSheets,
  getProtoWorkSheetById,
  updateProtoSection,
  getAllAdminActs,
  getMyActs,
  addActToProthesiste,
  updateActPrice,
  deleteAct,
};
