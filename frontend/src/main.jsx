import "./amplify";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Configure AWS Amplify before React renders so auth state is
// available across the entire app without a Provider wrapper.
import configureAmplify from "./config/amplify.js";
configureAmplify();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
