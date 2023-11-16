const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { findURLs, findDomains } = require("../config/url_domainExtractor");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const {
      default: { vault },
    } = await import("../config/pangea.mjs");
    let messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    // const key = messages[0].chat.encrytKeyName;
    // console.log(messages[0]);

    messages = await Promise.all(
      messages.map((msg) => {
        return new Promise(async (resolve) => {
          const r = await vault.decrypt(msg.chat.encrytKeyName, msg.content);
          msg.content = Buffer.from(r.result.plain_text, "base64").toString(
            "utf8"
          );
          resolve(msg);
        });
      })
    );

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    scores: [],
  };

  try {
    const {
      default: { vault, urlIntel, domainIntel },
    } = await import("../config/pangea.mjs");

    const url_options = { provider: "crowdstrike", verbose: false, raw: false };
    const domain_options = {
      provider: "domaintools",
      verbose: false,
      raw: false,
    };

    const urls = findURLs(content);
    const domains = findDomains(content);
    console.log({ urls, domains });

    newMessage.scores = await Promise.all([
      ...urls.map((url) => {
        return new Promise(async (resolve) => {
          const response = await urlIntel.reputation(url, url_options);
          resolve(response.result.data.verdict);
        });
      }),
      ...domains.map((domain) => {
        return new Promise(async (resolve) => {
          const response = await domainIntel.reputation(domain, domain_options);
          resolve(response.result.data.verdict);
        });
      }),
    ]);

    const chat = await Chat.findById(chatId);

    const data = Buffer.from(newMessage.content, "utf8").toString("base64");
    const encryptResponse = await vault.encrypt(chat.encrytKeyName, data);

    newMessage.content = encryptResponse.result.cipher_text;
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    message.content = content;

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
