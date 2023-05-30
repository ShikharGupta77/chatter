import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
});

// inside a database, you can have multiple documents. this is a docuement named messageContent (to hold all the messages)
const model = mongoose.model("messagecontents", messageSchema);

export default model;
