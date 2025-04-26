import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import { createRoot } from "react-dom/client";
import { initializeLoading } from "./utils/showLoading";

import App from "./App";

const finishLoading = initializeLoading();
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <CssBaseline>
        <App />
    </CssBaseline>
);

// Aumentado o tempo de espera para garantir que o app esteja carregado
setTimeout(finishLoading, 1000);