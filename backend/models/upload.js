const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // Adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("Upload", uploadSchema);