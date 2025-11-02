import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./core/styles/tailwind.css";
import "./core/styles/index.css";
import { App } from "./App";
import { store } from "./app/store";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
      <Provider store={store}>
        <App />
      </Provider>
  );
}
