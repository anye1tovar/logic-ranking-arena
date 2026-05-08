import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/800.css";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/700.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app/app";
import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
