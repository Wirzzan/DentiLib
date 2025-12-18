const User = require('../models/user.model.js');
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
 
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      siret,
      listeActes,
      associatedUser: null
    })
 
    await user.save()
 
    if (role === 'DENTISTE') {
      await user.save()
      return res.status(201).json({
        message: 'Dentiste created',
        user
      })
    }
 
    if (role === 'PROTHESISTE') {
      if (!dentisteId) {
        return res.status(400).json({
          message: 'dentisteId is required for prothesiste'
        })
      }
 
      const dentiste = await User.findById(dentisteId)
 
      if (!dentiste || dentiste.role !== 'DENTISTE') {
        return res.status(404).json({
          message: 'Dentiste not found'
        })
      }
 
      user.associatedUser = dentiste._id
      dentiste.associatedUser = user._id
 
      
      await dentiste.save()
 
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

module.exports = { createAccount, getAllUsers, deleteAccount, getUserById }