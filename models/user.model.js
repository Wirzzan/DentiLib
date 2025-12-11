const mongoose= require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true
    },

    lastName: {
      type: String,
      trim: true, 
      required: true
    },

    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minLength: 8
    
    },
    role: {
      type: String,
      enum: ["ADMIN", "DENTISTE", "PROTHESISTE"],
      required: true,
    },
    siret : {
        type: Number
    },
    associatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    listActs: [
        {
            acte:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Acte'
            },
            price: {
                type : Number,
                //required: true
            }
        }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);