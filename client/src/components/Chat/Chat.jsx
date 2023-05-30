import Search from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Avatar, IconButton } from "@mui/material";
import "./Chat.css";
import MoreVert from "@mui/icons-material/MoreVert";
import ChatMessage from "./ChatMessage";
import InsertEmoticon from "@mui/icons-material/InsertEmoticon";
import SendIcon from "@mui/icons-material/Send";
import { useRef, useEffect, useState } from "react";
import axios from "../../axios";
import Pusher from "pusher-js";

const Chat = (props) => {
    const chatBody = useRef(null);
    const input = useRef(null);
    const [addCodeInput, setAddCodeInput] = useState("");
    const user = props.user;
    const chats = props.chats;
    const activeChatId = props.activeChatId;
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        if (chatBody.current)
            chatBody.current.scrollTop = chatBody.current.scrollHeight;
    }, [activeChat]);

    // Bind pusher to message inserts
    useEffect(() => {
        var pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
            cluster: "us3",
        });

        var channel = pusher.subscribe("messageInsert");
        channel.bind(activeChatId, (message) => {
            console.log("received pusher message", message);
            setActiveChat((prevChat) => ({
                ...prevChat,
                messages: [...prevChat.messages, message],
            }));
        });

        return () => {
            channel.unbind("messageInsert");
            pusher.disconnect();
        };
    }, [activeChatId]);

    useEffect(() => {
        if (activeChatId) {
            axios
                .get(`/getMessages?chatId=${activeChatId}`)
                .then((res) => {
                    const resChats = res.data;
                    setActiveChat(resChats[0]);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [activeChatId]);

    function createChat(event) {
        event.preventDefault();
        axios
            .post("/createChat", { email: user.email, code: addCodeInput })
            .then(async (chat) => {
                const otherUser = await axios.get(
                    `/getUser?code=${addCodeInput}`
                );
                chat.members = [otherUser.data[0], user];
                props.setChats([...chats, chat]);
            })
            .catch((err) => console.log(err));
    }

    function sendMessage(event) {
        event.preventDefault();
        if (input.current.value.length === 0) {
            return;
        }

        const message = {
            name: user.name,
            message: input.current.value,
            senderEmail: user.email,
            timestamp: new Date(),
        };
        const chatId = activeChat._id;
        axios
            .post("/addMessage", { message, chatId })
            .then()
            .catch((err) => console.log(err));
        input.current.value = "";

        console.log("adding", chatId, message);
    }

    return (
        <div className="chat">
            {activeChatId && (
                <div className="chat__header">
                    <IconButton>
                        <Avatar
                            src={
                                activeChat &&
                                (activeChat.members[0].email === user.email
                                    ? activeChat.members[1].profileUrl
                                    : activeChat.members[0].profileUrl)
                            }
                        />
                    </IconButton>
                    <div className="chat__headerMiddle">
                        <h2>
                            {activeChat &&
                                (activeChat.members[0].email === user.email
                                    ? activeChat.members[1].name
                                    : activeChat.members[0].name)}
                        </h2>
                    </div>
                    <div className="div__chat_headerRight">
                        <IconButton>
                            <Search />
                        </IconButton>
                        <IconButton>
                            <AttachFileIcon />
                        </IconButton>
                        <IconButton>
                            <MoreVert />
                        </IconButton>
                    </div>
                </div>
            )}

            {!user ? (
                <div className="chat__signIn">
                    <h1>Sign in with Google on the left!</h1>
                </div>
            ) : !activeChatId ? (
                <div className="chat__addConversation">
                    <h3>Your code is: {user.code}</h3>
                    <p>
                        Your friends can enter your code in their account to
                        start a conversation with you!
                    </p>
                    <form onSubmit={(event) => createChat(event)}>
                        <input
                            onChange={(event) =>
                                setAddCodeInput(event.target.value)
                            }
                            placeholder="Enter your friend's code here"
                            className="chat__addField"
                        />
                    </form>
                </div>
            ) : (
                <>
                    <div className="chat__body" ref={chatBody}>
                        {activeChat &&
                            activeChat.messages.map((message) => (
                                <ChatMessage
                                    key={message._id}
                                    message={message.message}
                                    name={message.name}
                                    timestamp={message.timestamp}
                                    received={
                                        message.senderEmail !== user.email
                                    }
                                />
                            ))}
                    </div>
                    <div>
                        <form onSubmit={sendMessage} className="chat__footer">
                            <IconButton>
                                <InsertEmoticon />
                            </IconButton>
                            <input
                                placeholder="Type a message"
                                type="text"
                                className="chat__inputField"
                                ref={input}
                            />
                            <IconButton type="submit">
                                <SendIcon />
                            </IconButton>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chat;
