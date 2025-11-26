const { Schema } = require("mongoose");


const messageSchema = Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "chat",
  },

  senderId: {
    type: Schema.Types.ObjectId,
    ref:"user"
  },

  text: {
    type: String,
    required: true
  }
  ,
  
  status: {
    type: String,
    enum:["Sent", "Delivered", "Seen"]
  }


}, {timeStamps: true});