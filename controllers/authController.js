const bcrypt = require('bcrypt');
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken')
require('dotenv').config()
 
 
exports.registerAdmin = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "L'email est requis" });
    }
    if (!password) {
        return res.status(400).json({ message: "Le mot de passe est requis" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir plus de 3 caractères" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "ADMIN"
    });

    res.status(201).json({ message: "Utilisateur créé", user: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
 
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }
    if (!password) {
      return res.status(400).json({ message: "Le mot de passe est requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({message: `L'utilisateur n'existe pas`});
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({message: "Mot de passe incorrect"});
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({message: `Vous êtes connecté ${user.firstName}`,token, role:user.role});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur",error: error.message });
  }
};
 
exports.deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.user.id;
        const connectedUser = req.user;
 
        if (connectedUser.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }
        const user = await User.findById(userIdToDelete);
 
        if (!user) {
            return res.status(404).json({
                message: "Admin not found."
            });
        }
 
 
        await User.findByIdAndDelete(userIdToDelete);
 
        return res.status(200).json({
            message: "User deleted successfully."
        });
 
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};

