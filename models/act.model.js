const mongoose = require("mongoose");

const acteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    }
  },
);

module.exports = mongoose.model("Acte", acteSchema);