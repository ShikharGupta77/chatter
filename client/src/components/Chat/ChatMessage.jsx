import React from "react";
import "./ChatMessage.css";

function ChatMessage(props) {
    const date = new Date(props.timestamp).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        month: "numeric",
        day: "numeric",
        year: "numeric",
    });
    return (
        <p className={`chat__message ${!props.received && "chat__receiver"}`}>
            <span className="chat__name">{props.name}</span>
            {props.message}
            <span className="chat__timestamp">{date}</span>
        </p>
    );
}

export default ChatMessage;
