import "./App.css";
import Sidebar from "./components/sidebar/Sidebar";
import Chat from "./components/Chat/Chat";
import { useEffect, useState } from "react";
import axios from "./axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

function App() {
    const [messages, setMessages] = useState([]);
    const [startConversation, setStartConversation] = useState(true); // this will be true if the start conversation button is clicked
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);

    return (
        <div className="app">
            <div className="app__body">
                <Sidebar
                    user={user}
                    setUser={setUser}
                    chats={chats}
                    setChats={setChats}
                    setActiveChatId={setActiveChatId}
                />
                <Chat
                    messages={messages}
                    user={user}
                    chats={chats}
                    setChats={setChats}
                    activeChatId={activeChatId}
                />
            </div>
        </div>
    );
}

export default App;
