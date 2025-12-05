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

    var populateChat = await Chat.findById(newChat._id).populate(
      "participants",
      "fullName email"
    );

    return res.status(200).json({ ok: true, chat: populateChat });
  } catch (error) {
    console.log("error", error);

    return res.status(500).json({ ok: false, error: "server error" });
  }
};

module.exports = chatControllers;
