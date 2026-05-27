const { Schema, model } = require("mongoose");


const messageSchema = Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "chat",
  },

  senderId: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },

  text: {
    type: String,
    required: true
  }
  ,

  status: {
    type: String,
    enum: ["Sent", "Delivered", "Seen"],
    default: "Sent"
  }


}, { timestamps: true });



const message = model("message", messageSchema);

module.exports = message;