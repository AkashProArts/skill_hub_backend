const message = require("../models/message.model");
const chat = require("../models/chat.model");
const { raw } = require("express");

function chatSocket(io) {
  const userSocketMap = new Map();


  io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log("User joined chat: ", chatId);
    });

    socket.on("register", (userId => {


      userSocketMap.set(userId, socket.id);
      
    }))

    socket.on("sendMessage", async (data) => {
      try {
        console.log("sendMessage payload", data);

        const { chatId: rawChatId, senderId, text } = data;

        if (!rawChatId || !text || !senderId) {

          console.warn("missing fields in sendMessage:", { rawChatId, senderId, text });
          socket.emit("messageError", { error: "Missing required fields" });
          return;
        }
        const chatId = rawChatId.toString();


        console.log("socket.room (client rooms):", Array.from(socket.rooms));
        console.log("all rooms keys:", Array.from(io.sockets.adapter.rooms.keys()).slice(0, 50));



        const messageResult = await message.create({
          chatId,
          senderId,
          text,
          status: "Sent",
        });

        // Update the lastMessage reference in the chat
        await chat.findByIdAndUpdate(chatId, {
          lastMessage: messageResult._id,
          updatedAt: new Date()
        });

        console.log("messageResult: ", messageResult);

        // Emit to all users in the chat room
        // io.to(chatId).emit("newMessage", messageResult);

        const chatDoc = await chat.findById(chatId);

        if (chatDoc) {
          
          chatDoc.participants.forEach((participantId) => {

            const socketId = userSocketMap.get(participantId.toString());
            if (socketId) {
              
              io.to(socketId).emit("newMessage", messageResult)
            }
            
          });
        }

        // // Send delivery confirmation to sender
        // socket.emit("messageDelivered", { messageId: messageResult._id });

        // Update status to Delivered for other participants
        // Wait a bit for other clients to receive, then update
        // setTimeout(async () => {
          try {
            await message.findByIdAndUpdate(messageResult._id, { status: "Delivered" });
            // Emit updated status to all participants
            io.to(chatId).emit("messageStatusUpdated", {
              messageId: messageResult._id,
              status: "Delivered"
            });
          } catch (err) {
            console.error("Error updating message to Delivered:", err);
          }
        // }
        // , 500);

      } catch (err) {

        console.error("sendMessage handler error:", err);

      }
    });

    socket.on("markAsRead", async (data) => {
      try {
        console.log("markAsRead payload:", data);

        const { messageIds, chatId } = data;

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
          console.warn("Invalid messageIds in markAsRead:", messageIds);
          return;
        }

        // Update all messages to Seen
        await message.updateMany(
          { _id: { $in: messageIds } },
          { status: "Seen" }
        );

        // Emit read receipt to all participants in the chat
        if (chatId) {
          io.to(chatId).emit("messageStatusUpdated", {
            messageIds,
            status: "Seen"
          });
        }

        console.log("Messages marked as read:", messageIds);
      } catch (err) {
        console.error("markAsRead handler error:", err);
      }
    });

    socket.on("disconnect", () => {

      for (const [userId, socketId] of userSocketMap.entries()) {
        
        if (socketId === socket.id) {
          
          userSocketMap.delete(userId);
          break;
        }
      }


      console.log("user disconnected")
    });
  });







}

module.exports = chatSocket;
