// importing
import express from "express";
import mongoose, { trusted } from "mongoose";
import * as dotenv from "dotenv";
import Messages from "./schemas/dbMessages.js";
import Users from "./schemas/User.js";
import Chat from "./schemas/Chat.js";
import Message from "./schemas/Message.js";
import bodyParser from "body-parser";
import Pusher from "pusher";
import cors from "cors";

// DB config
dotenv.config();

// app config
const app = express(); // creates the application and allows us to write API routes
const port = process.env.PORT || 9000;

/* pusher: pusher is kind of like socket.io, it's between frontend and mongoose, so when frontend triggers a message to mongoose, pusher is listening  
   and is triggered to send a message to the frontend to refresh data (better than reloding every 5 seconds, makes mongodb realtime) */
const pusher = new Pusher({
    appId: process.env.PUSHER_APPID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: "us3",
    useTLS: true,
});

// middleware
app.use(express.json()); // middleware, meaning that a request will go through app.use() methods before going to endpoint
app.use(cors()); // allows frontend to actually send requests to backend

// database
const connection_url = process.env.MONGOOSE_URL;
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB is connected");
    const msgCollection = db.collection("chats");
    const changeStream = msgCollection.watch(); // pusher will watch messages collection for any changes

    changeStream.on("change", async (change) => {
        if (change.operationType == "update") {
            const messageDetails = change.updateDescription.updatedFields;
            const messageId = Object.keys(messageDetails).find((key) =>
                key.startsWith("messagesId")
            );
            const message = await Message.findById(messageDetails[messageId]);
            const chatId = change.documentKey._id;
            pusher.trigger("messageInsert", chatId, message);
        } else {
            console.log("error triggering pusher");
        }
    });
});

// api routes
/* 200: okay, 404 and 500 error */
app.get("/", (req, res) => res.status(200).send("I love express!")); // "/" is the endpoint for the REST api

// if their email is not in the database, then add them to the database. Then return their unique code (for other people to use to connect).
app.post("/signIn", (req, res) => {
    const { name, email, profileUrl } = req.body;
    Users.findOne({ email: email })
        .then((user) => {
            if (user) {
                res.status(200).send(user.code);
            } else {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
                let code = "";
                for (let i = 0; i < 6; i++) {
                    code += chars.charAt(
                        Math.floor(Math.random() * chars.length)
                    );
                }
                Users.create({ name, email, profileUrl, code })
                    .then((user) => {
                        res.status(200).send(user.code);
                    })
                    .catch((err) => {
                        res.status(404).send(err);
                    });
            }
        })
        .catch((err) => {
            res.status(404).send(err);
        });
});

// Will get email and code and will create chat between the two (email is requesting to create chat with code). If code is invalid, we will give code 400: bad request
app.post("/createChat", async ({ body: { email, code } }, res) => {
    try {
        const otherUser = await Users.findOne({ code });
        if (otherUser) {
            const currentUser = await Users.findOne({ email });
            const chat = await Chat.create({
                membersId: [currentUser, otherUser],
                messagesId: [],
            });
            res.status(200).send(chat);
        } else {
            res.status(400).send({
                Error: "User with requested code not found.",
            });
        }
    } catch (err) {
        res.status(404).send(err);
    }
});

app.get("/getChats", async (req, res) => {
    const query = req.query;
    const email = query.email;
    const chats = await Chat.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "membersId",
                foreignField: "_id",
                as: "members",
            },
        },
        {
            $match: {
                "members.email": email,
            },
        },
    ]).exec();
    res.status(200).send(chats);
});

app.get("/getUser", async (req, res) => {
    const code = req.query.code;
    Users.find({ code })
        .then((data) => res.status(200).send(data))
        .catch((err) => res.status(404).send(err));
});

app.get("/getMessages", async (req, res) => {
    const chatId = req.query.chatId;
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        {
            $lookup: {
                from: "messages",
                localField: "messagesId",
                foreignField: "_id",
                as: "messages",
            },
        },
        {
            $unwind: {
                path: "$messages",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $sort: {
                "messages.timestamp": 1,
            },
        },
        {
            $group: {
                _id: "$_id",
                membersId: { $first: "$membersId" },
                messages: { $push: "$messages" },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "membersId",
                foreignField: "_id",
                as: "members",
            },
        },
    ]);
    res.status(200).send(chat);
});

// at the ap1/v1/messages/new endpoint, we can take in requests for a message, and then create a row in the messageContent document for that message
app.post("/messages/new", (req, res) => {
    const dbMessage = req.body; // will send the message in request body from the frontend
    //console.log(dbMessage);
    // create the dbMessage in the Messages document
    Messages.create(dbMessage)
        .then((data) => {
            res.status(200).send(data);
            console.log("added message");
        })
        .catch((err) => {
            res.status(500).send(err);
            console.log("error adding message");
        });
});

app.post("/addMessage", async (req, res) => {
    const body = req.body;
    const messageInfo = body.message;
    const chatId = body.chatId;
    const message = await Message.create(messageInfo);
    if (!message) {
        res.status(404).send("Error creating message");
    }
    const chat = await Chat.findById(chatId);
    chat.messagesId.push(message);
    await chat.save();
    res.status(200).send(message);
});

// listeners
app.listen(port, () => console.log(`Listening on localhost:${port}`)); // listens for api calls on port port
