const Acte = require('../models/act.model.js')


const getAllActes = async (req, res) => {
  try {
    const actes = await Acte.find()
    return res.status(200).json({ actes })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
}

const createActe = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        message: "Acte name is required"
      })
    }

    const existingActe = await Acte.findOne({ name })
    if (existingActe) {
      return res.status(409).json({
        message: "Acte already exists"
      })
    }

    const acte = await Acte.create({
      name,
      description
    })

    return res.status(201).json({
      message: "Acte created successfully",
      acte
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
}

const updateActe = async (req, res) => {
  try {
    const { acteId } = req.params
    const { name, description } = req.body

    const acte = await Acte.findById(acteId)
    if (!acte) {
      return res.status(404).json({ message: "Acte not found" })
    }

    if (name) acte.name = name
    if (description) acte.description = description

    await acte.save()

    return res.status(200).json({
      message: "Acte updated successfully",
      acte
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
}

const deleteActe = async (req, res) => {
  try {
    const { acteId } = req.params

    const acte = await Acte.findById(acteId)
    if (!acte) {
      return res.status(404).json({ message: "Acte not found" })
    }

    await Acte.findByIdAndDelete(acteId)

    return res.status(200).json({
      message: "Acte deleted successfully"
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
}

module.exports = { getAllActes, createActe, updateActe, deleteActe }
