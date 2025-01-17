import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { HelmetProvider } from "react-helmet-async";
import axios from "axios";
import App from "./app";

import { worker } from "./mocks/browser";

if (
  process.env.NODE_ENV === "development" &&
  import.meta.env.VITE_USE_MOCKS === "true"
) {
  worker.start();
}

// TO Axios using
// Axios - Set default configurations
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;
const token = localStorage.getItem("access_token");
// Set the token in Axios default headers
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
);
