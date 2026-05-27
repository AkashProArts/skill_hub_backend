const express = require("express");

const router = express.Router();

const chatControllers = require("../controllers/chat.controller");

router.post("/get-chat-details", chatControllers.getChatDetails);

// Get all chats for authenticated user
router.get("/chats", chatControllers.getUserChats);

// Get messages for a specific chat with pagination
router.get("/chats/:chatId/messages", chatControllers.getChatMessages);

// Mark message as read
router.put("/messages/:messageId/read", chatControllers.markMessageAsRead);


module.exports = router;
