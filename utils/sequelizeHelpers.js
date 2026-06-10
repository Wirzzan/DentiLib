// Adapte les données MySQL (id numérique) au format attendu par le front (_id texte).
// Utilisé dans les contrôleurs avant res.json().

const toId = (id) => (id != null ? String(id) : id);

const formatActe = (acte) => {
  if (!acte) return null;
  const plain = acte.get ? acte.get({ plain: true }) : acte;
  return { ...plain, _id: toId(plain.id) };
};

const formatUser = (user) => {
  if (!user) return null;
  const plain = user.get ? user.get({ plain: true }) : { ...user };
  delete plain.password;

  const formatted = { ...plain, _id: toId(plain.id) };

  if (plain.associatedUser) {
    formatted.associatedUser = formatUser(plain.associatedUser);
  }

  return formatted;
};

// Format catalogue prothésiste (ex listActs MongoDB)
const formatListAct = (row) => {
  const plain = row.get ? row.get({ plain: true }) : row;
  const acte = plain.acte || plain.Acte;

  return {
    _id: toId(plain.id),
    acte: acte ? formatActe(acte) : { _id: toId(plain.acteId) },
    price: plain.price != null ? parseFloat(plain.price) : null,
  };
};

// Format fiche de travaux (ex WorkSheet MongoDB)
const formatWorkSheet = (fiche) => {
  if (!fiche) return null;
  const plain = fiche.get ? fiche.get({ plain: true }) : fiche;

  const acts = (plain.acts || []).map((a) => ({
    _id: toId(a.id),
    acteId: toId(a.acteId),
    name: a.name,
    description: a.description,
    price: a.price != null ? parseFloat(a.price) : 0,
  }));

  return {
    ...plain,
    _id: toId(plain.id),
    idUser: toId(plain.utilisateurId),
    idProthesiste: plain.prothesisteId != null ? toId(plain.prothesisteId) : null,
    acts,
  };
};

const userId = (id) => Number(id);

module.exports = {
  formatActe,
  formatUser,
  formatListAct,
  formatWorkSheet,
  userId,
  toId,
};
