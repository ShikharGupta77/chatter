import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    name: String,
    message: String,
    senderEmail: String,
    timestamp: Date,
});

// inside a database, you can have multiple documents. this is a docuement named messageContent (to hold all the messages)
const model = mongoose.model("Message", messageSchema, "messages");

export { messageSchema };
export default model;
