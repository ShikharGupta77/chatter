import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

ReactDOM.render(
    <React.StrictMode>
        <GoogleOAuthProvider
            clientId="898118796318-7gtsdtadkqjis0gejlhifch4ieu6i7og.apps.googleusercontent.com"
            className="googleButton"
        >
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
