const { Schema, model } = require("mongoose");

const userSchema = Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["LEARNER", "MENTOR"],
      required: true,
      default: "LEARNER",
    },
    password: {
      type: String,
      required: true,
    },

    
  },
  { timeStamps: true }
);

const User = model("user", userSchema);

module.exports = User;
