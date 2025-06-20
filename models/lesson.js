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
      unique: true
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
  },
  { timeStamps: true }
);

const lesson =  model("lesson", lessonSchema);

module.exports = lesson;
