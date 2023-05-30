import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    profileUrl: String,
    code: String,
});

const model = mongoose.model("User", userSchema, "users");

export default model;
