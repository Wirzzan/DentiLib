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
        "EN_ATTENTE",
        "EN_COURS",
        "TERMINE",
        "EN_ATTENTE_PAIEMENT",
        "PAYE",
      ],
      default: "EN_ATTENTE",
      required: true,
    },
    
    acts: [
      {
        name: {
          type: String,
          trim: true,
        },
        price: {
          type: Number
        }
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkSheet", acteSchema);