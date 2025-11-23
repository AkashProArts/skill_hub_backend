const { Schema, model } = require("mongoose");

const lessonSchema = Schema(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },

    lessonType: {
      type: String,
      required: true,
      enum: ["DOC", "VIDEO"],
    },
    content: {
      type: String,
      unique: true,
    },

    views: [{ type: Schema.Types.ObjectId, ref: "user" }],
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

const Lesson = model("lesson", lessonSchema);

module.exports = Lesson;
