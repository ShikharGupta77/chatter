import { Avatar } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import "./SidebarChat.css";

function SidebarChat(props) {
    return (
        <div className="sidebarChat" onClick={() => props.onClick()}>
            {props.create ? (
                <>
                    <AddCircleIcon sx={{ margin: "1em" }} />
                    <div>
                        <h3>Start a conversation</h3>
                    </div>
                </>
            ) : (
                <>
                    <Avatar sx={{ margin: "1em" }} src={props.profileUrl} />
                    <div>
                        <h3>{props.name}</h3>
                    </div>
                </>
            )}
        </div>
    );
}

export default SidebarChat;
