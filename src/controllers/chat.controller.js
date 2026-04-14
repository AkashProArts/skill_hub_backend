const chatControllers = {};

const e = require("express");
const Chat = require("../models/chat.model");

chatControllers.getChatDetails = async (req, res) => {
  console.log("createIndividualChat triggered");

  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ ok: false, error: "The request body is missing" });
    }
    console.log(req.body);

    var { user1, user2 } = req.body;
    if (!user1 || !user2) {
      return res.status(400).json({ ok: false, error: "Need both users" });
    }

    let existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [user1, user2], $size: 2 },
    })
      .select("-__v")
      .lean();

    if (existingChat) {
      // console.log("existing chat : ", existingChat);

      return res.status(200).json({ ok: true, chatId: existingChat._id, isGroup: existingChat.isGroup });
    }

    var newChat = await Chat.create({
      participants: [user1, user2],
      isGroup: false,
    });
console.log('newChat: ', newChat);

 
    return res
      .status(200)
      .json({
        ok: true,
        chatId: newChat._id,
        isGroup: newChat.isGroup,
      });
  } catch (error) {
    console.log("error", error);

    return res.status(500).json({ ok: false, error: "server error" });
  }
};

// Get all chats for the authenticated user
chatControllers.getUserChats = async (req, res) => {
 
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "fullName email profilePicture")
      .populate({
        path: "lastMessage",
        select: "text senderId createdAt status",
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate unread count for each chat (mock for now - will implement properly later)
    const chatsWithMetadata = chats.map((chat) => ({
      ...chat,
      unreadCount: 0, // TODO: Implement actual unread count logic
    }));

    return res.status(200).json({ ok: true, chats: chatsWithMetadata });
  } catch (error) {
    console.log("getUserChats error:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Get messages for a specific chat with pagination
chatControllers.getChatMessages = async (req, res) => {

  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!chatId) {
      return res.status(400).json({ ok: false, error: "Chat ID is required" });
    }

    
  
    const Message = require("../models/message.model");

    // Get total count for pagination metadata
    const totalMessages = await Message.countDocuments({ chatId });

    // Fetch messages (sorted by createdAt ascending for chronological order)
    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "fullName email")
      .lean();
    messages.reverse();

    const hasMore = skip + messages.length < totalMessages;

    return res.status(200).json({
      ok: true,
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
        hasMore,
      },
    });
  } catch (error) {
    console.log("getChatMessages error:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Mark message as read
chatControllers.markMessageAsRead = async (req, res) => {
  console.log("markMessageAsRead triggered");

  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res
        .status(400)
        .json({ ok: false, error: "Message ID is required" });
    }

    const Message = require("../models/message.model");

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status: "Seen" },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ ok: false, error: "Message not found" });
    }

    return res.status(200).json({ ok: true, message: updatedMessage });
  } catch (error) {
    console.log("markMessageAsRead error:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

module.exports = chatControllers;
