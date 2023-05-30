import "./Sidebar.css";
import ChatIcon from "@mui/icons-material/Chat";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, IconButton, InputAdornment, Input } from "@mui/material";
import SidebarChat from "./SidebarChat";
import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "../../axios";

function Sidebar(props) {
    //const [user, setUser] = [props.user, props.setUser];
    const user = props.user;
    const chats = props.chats;

    function signIn(code) {
        const decoded = jwt_decode(code.credential);
        const user = {
            name: decoded.name,
            email: decoded.email,
            profileUrl: decoded.picture,
        };
        axios
            .post("/signIn", user)
            .then((res) => {
                const code = res.data;
                props.setUser({ ...user, code });
            })
            .catch((err) => {
                console.log(err);
            });
        axios
            .get(`/getChats?email=${decoded.email}`)
            .then((res) => {
                const chats = res.data;
                props.setChats(chats);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <IconButton>
                    <Avatar src={user ? user.profileUrl : ""} />
                </IconButton>
                <div className="sidebar__headerRight">
                    {/* IconButton makes the Icon clickable (parent class of icons) */}
                    <IconButton>
                        <DonutLargeIcon />
                    </IconButton>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>
            <div className="sidebar__chats">
                <div className="sidebar__chatsSearch"></div>

                {user ? (
                    <>
                        <SidebarChat
                            create={true}
                            onClick={() => {
                                props.setActiveChatId(null);
                                console.log();
                            }}
                        />
                        {chats &&
                            chats
                                .map((chat) => (
                                    <SidebarChat
                                        onClick={() => {
                                            props.setActiveChatId(chat._id);
                                        }}
                                        key={chat._id}
                                        name={
                                            chat.members[0].email === user.email
                                                ? chat.members[1].name
                                                : chat.members[0].name
                                        }
                                        profileUrl={
                                            chat.members[0].email === user.email
                                                ? chat.members[1].profileUrl
                                                : chat.members[0].profileUrl
                                        }
                                    ></SidebarChat>
                                ))
                                .reverse()}
                    </>
                ) : (
                    <GoogleLogin
                        onSuccess={(res) => signIn(res)}
                        onError={(err) => {
                            console.log(err);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default Sidebar;
