const message = require("../models/message.model");

function chatSocket(io) {



  io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log("User joined chat: ");
    });

    socket.on("sendMessage", async (data) => {
      const { chatId, senderId, text } = data;

      const message = await message.create({
        chatId,
        senderId,
        text,
      });

      await chat.findByIdAndUpdate(chatId, { lastmessage: message._id });
      io.to(chatId).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
    
    
    
    
    
    
    
}

module.exports = chatSocket;
