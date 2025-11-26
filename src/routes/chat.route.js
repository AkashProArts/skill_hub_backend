const express = require("express");

const router = express.Router();

const chatControllers = require("../controllers/chat.controller");

router.post("/get-chat-details", chatControllers.getChatDetails);



module.exports = router;
