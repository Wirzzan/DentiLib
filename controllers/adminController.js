const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { Utilisateur, sequelize } = require("../models");
const { sendMail } = require("../utils/mailer");
const { formatUser } = require("../utils/sequelizeHelpers");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  try {
    const { email, password, lastName, firstName, role, siret, associatedUser } = req.body;

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Utilisateur.create({
      email,
      password: hashedPassword,
      lastName,
      firstName,
      role,
      siret,
      associatedUserId: associatedUser || null,
    });

    res.status(201).json({ message: "Utilisateur créé", user: formatUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, siret, dentisteId } = req.body;

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Cette adresse mail est déjà utilisée" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "DENTISTE") {
      const user = await Utilisateur.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        siret,
        associatedUserId: null,
      });

      await sendMail(
        email,
        "Bienvenue sur Dentilib",
        `
        <h2>Bonjour ${firstName} ${lastName}</h2>
        <p>Votre compte Dentilib a été créé avec succès.</p>
        <p>Pour la protection de votre compte, pensez à sécuriser les identifiants</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe :</strong> ${password}</p>
        <p><strong>Rôle :</strong> ${role}</p>
        <p>Vous pouvez maintenant vous connecter.</p>
        <br>
        <p>L'équipe Dentilib 🦷</p>
        `
      );

      return res.status(201).json({ message: "Le dentiste a été créé", user: formatUser(user) });
    }

    if (role === "PROTHESISTE") {
      if (!dentisteId) {
        return res.status(400).json({ message: "dentisteId is required for prothesiste" });
      }

      const dentiste = await Utilisateur.findByPk(dentisteId);
      if (!dentiste || dentiste.role !== "DENTISTE") {
        return res.status(404).json({ message: "Dentiste not found" });
      }

      const prothesiste = await sequelize.transaction(async (t) => {
        const created = await Utilisateur.create(
          {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            siret,
            associatedUserId: dentiste.id,
          },
          { transaction: t }
        );

        dentiste.associatedUserId = created.id;
        await dentiste.save({ transaction: t });

        return created;
      });

      await sendMail(
        email,
        "Votre compte Dentilib est prêt",
        `
        <h2>Bonjour ${firstName}</h2>
        <p>Votre compte prothésiste a été créé.</p>
        <p>Vous êtes associé au dentiste :</p>
        <p><strong>${dentiste.firstName} ${dentiste.lastName}</strong></p>
        <br>
        <p>Pour la protection de votre compte, pensez à sécuriser les identifiants</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe :</strong> ${password}</p>
        <p><strong>Rôle :</strong> ${role}</p>
        <p>Vous pouvez maintenant vous connecter.</p>
        <p>L'équipe Dentilib 🦷</p>
        `
      );

      await dentiste.reload();

      return res.status(201).json({
        message: "Prothesiste created and linked to dentiste",
        prothesiste: formatUser(prothesiste),
        dentiste: formatUser(dentiste),
      });
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, password, siret, dentisteId } = req.body;

    const user = await Utilisateur.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "L'utilisateur n'a pas été trouvé" });
    }

    if (email && email !== user.email) {
      const existing = await Utilisateur.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Cet email existe déjà" });
      }
      user.email = email;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.siret = siret;

    if (password && password.length >= 8) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (user.role === "PROTHESISTE") {
      if (!dentisteId) {
        return res.status(400).json({ message: "dentisteId required" });
      }

      if (user.associatedUserId) {
        await Utilisateur.update(
          { associatedUserId: null },
          { where: { id: user.associatedUserId } }
        );
      }

      const newDentiste = await Utilisateur.findByPk(dentisteId);
      if (!newDentiste || newDentiste.role !== "DENTISTE") {
        return res.status(404).json({ message: "Le dentiste n'a pas été trouvé" });
      }

      user.associatedUserId = newDentiste.id;
      newDentiste.associatedUserId = user.id;
      await newDentiste.save();
    }

    await user.save();

    return res.status(200).json({
      message: "Utilisateur a été mis à jour",
      user: formatUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Utilisateur.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.associatedUserId) {
      await Utilisateur.update(
        { associatedUserId: null },
        { where: { id: user.associatedUserId } }
      );
    }

    await user.destroy();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll();
    res.status(200).json(users.map(formatUser));
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Utilisateur.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: formatUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllDentistes = async (req, res) => {
  try {
    const dentistes = await Utilisateur.findAll({
      where: { role: "DENTISTE" },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    return res.status(200).json({ dentistes: dentistes.map(formatUser) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getDentistesNotAssociated = async (req, res) => {
  try {
    const dentistes = await Utilisateur.findAll({
      where: { role: "DENTISTE", associatedUserId: null },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    return res.status(200).json({ dentistes: dentistes.map(formatUser) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllUsersWithoutAdmin = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      where: { role: { [Op.ne]: "ADMIN" } },
      include: [
        {
          model: Utilisateur,
          as: "associatedUser",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    });

    return res.status(200).json({ users: users.map(formatUser) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAccount,
  getAllUsers,
  deleteAccount,
  getUserById,
  getAllDentistes,
  getDentistesNotAssociated,
  getAllUsersWithoutAdmin,
  updateAccount,
};
