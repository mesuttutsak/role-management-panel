import React from "react";
import ReactDOM from "react-dom/client";
import "./core/styles/tailwind.css";
import "./core/styles/index.css";
import { App } from "./App";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
