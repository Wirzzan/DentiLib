const mongoose = require("mongoose");

const acteSchema = new mongoose.Schema(
  {
    numFiche: {
      type: Number,
      required: true,
      trim: true,
    },
    remarque: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "BROUILLON",
        "EN_ATTENTE",
        "EN_COURS",
        "TERMINE",
        "EN_ATTENTE_PAIEMENT",
        "PAYE",
      ],
      default: "BROUILLON",
      required: true,
    },
    
    acts: [
      {
        acteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Act", // référence à l’acte admin
          required: true
        },
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true }
      }
    ],

     nomPatient: {
      type: String,
      required: true,
      trim: true,
    },

    prenomPatient: {
      type: String,
      required: true,
      trim: true,
    },

    emailPatient: {
      type: String,
      trim: true,
      lowercase: true,
      required: true
    },

    numSecuPatient: {
      type: Number,
    },

    facturePDF: {
      type: String,
      trim: true,
    },

    idUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    idProthesiste: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    proDateLivraison: {
      type: Date,
      default: null
    },
    proDatePaiement: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkSheet", acteSchema);