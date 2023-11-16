const mongoose = require("mongoose");
// const { vault, Vault } = require("../config/pangea.mjs").default;

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    encrytKeyName: { type: String },
  },
  { timestamps: true }
);

chatModel.pre("save", async function (next) {
  const name = this._id.toString();
  let encrytKeyName = "";

  console.log("before save");

  try {
    await import("../config/pangea.mjs").then(async (mod) => {
      const {
        default: { Vault, vault },
      } = mod;

      const createRespose = await vault.symmetricGenerate(
        Vault.SymmetricAlgorithm.AES128_CFB,
        Vault.KeyPurpose.ENCRYPTION,
        name
      );

      this.encrytKeyName = createRespose.result.id;
    });
  } catch (e) {
    throw new Error(e.message);
  }
  console.log({ pk: this });
});

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
