const User = require('../models/user.model.js');
const bcrypt = require("bcrypt");
const { sendMail } = require("../utils/mailer");
const jwt = require('jsonwebtoken')
require('dotenv').config()



exports.registerUser = async (req, res) => {
   try {
    const {email, password,lastName,firstName,role, siret, associatedUser,actesList } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      lastName,
      firstName,
      role,
      siret,
      associatedUser,
      actesList
    });

    res.status(201).json({message: "Utilisateur créé",user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,        
      siret,
      listeActes,
      dentisteId  
    } = req.body
 
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      siret,
      listeActes,
      associatedUser: null
    })
 
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: "Cette adresse mail est déjà utilisée" })
    }
 
    if (role === 'DENTISTE') {
      await user.save()

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

      return res.status(201).json({ message: 'Le dentiste a été créé', user})
    }
 
    if (role === 'PROTHESISTE') {
      if (!dentisteId) {
        return res.status(400).json({ message: 'dentisteId is required for prothesiste' })
      }
 
      const dentiste = await User.findById(dentisteId)
      if (!dentiste || dentiste.role !== 'DENTISTE') {
        return res.status(404).json({ message: 'Dentiste not found' })
      }
  
      user.associatedUser = dentiste._id
      dentiste.associatedUser = user._id
      
      await user.save()
      await dentiste.save()

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

      return res.status(201).json({
        message: 'Prothesiste created and linked to dentiste',
        prothesiste: user,
        dentiste
      })
    }
 
    return res.status(400).json({ message: 'Invalid role' })
 
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
} 

const updateAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, password, siret, dentisteId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "L'utilisateur n'a pas été trouvé" });
    }

    // Vérifier email unique si modifié
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Cet email existe déjà" });
      }
      user.email = email;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.siret = siret;

    if (password && password.length >= 8) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Modifier association du PROTHESISTE
    if (user.role === "PROTHESISTE") {
      if (!dentisteId) {
        return res.status(400).json({ message: "dentisteId required" });
      }

      // Si retrait de l'id associé, libérer l'autre user de l'association
      if (user.associatedUser) {
        await User.findByIdAndUpdate(user.associatedUser, {
          associatedUser: null
        });
      }

      const newDentiste = await User.findById(dentisteId);
      if (!newDentiste || newDentiste.role !== "DENTISTE") {
        return res.status(404).json({ message: "Le dentiste n'a pas été trouvé" });
      }

      user.associatedUser = newDentiste._id;
      newDentiste.associatedUser = user._id;

      await newDentiste.save();
    }

    await user.save();

    return res.status(200).json({
      message: "Utilisateur a été mis à jour",
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    if (user.associatedUser) {
      await User.findByIdAndUpdate(
        user.associatedUser,
        { associatedUser: null }
      )
    }

    await User.findByIdAndDelete(userId)

    return res.status(200).json({
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({message: "User not found"})
    }
    return res.status(200).json({user})

  } catch (error) {
    console.error(error)
    res.status(500).json({message: "Server error"})
  }
}

const getAllDentistes = async (req, res) => {
  try {
    const dentistes = await User.find({ role: "DENTISTE" })
      .select("firstName lastName email");

    return res.status(200).json({ dentistes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getDentistesNotAssociated = async (req, res) => {
  try {
    const dentistes = await User.find({ role: "DENTISTE", associatedUser: null })
      .select("firstName lastName email");

    return res.status(200).json({ dentistes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllUsersWithoutAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "ADMIN" } })
      .populate("associatedUser", "firstName lastName role");

    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = { createAccount, getAllUsers, deleteAccount, getUserById, getAllDentistes, getDentistesNotAssociated, getAllUsersWithoutAdmin, updateAccount }