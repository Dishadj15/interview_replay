import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { useAuthStore } from "./store/authStore";
import "./index.css";

function Bootstrap() {
  const initialize = useAuthStore((state) => state.initialize);

  React.useEffect(() => {
    void initialize();
  }, [initialize]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Bootstrap />
    </BrowserRouter>
  </React.StrictMode>,
);
