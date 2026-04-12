const { Schema, model } = require("mongoose");

const chatSchema = Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    isGroup: { type: Boolean, required: true },
    name: { type: String },
    lastMessage: { type: Schema.Types.ObjectId, ref: "message" },
  },
  { timestamps: true }
);

const chat = model("chat", chatSchema);

module.exports = chat;
