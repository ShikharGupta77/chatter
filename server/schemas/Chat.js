import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    membersId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messagesId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

const model = mongoose.model("Chat", chatSchema, "chats");

export default model;
