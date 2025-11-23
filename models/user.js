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
    // Reviews List
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Ratings list
    ratings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        value: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Ratings summary
    ratingsSummary: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timeStamps: true }
);

const User = model("user", userSchema);

module.exports = User;
