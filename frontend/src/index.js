import CssBaseline from "@material-ui/core/CssBaseline";
import React from "react";
import ReactDOM from "react-dom";
import { initializeLoading } from "./utils/showLoading";

import App from "./App";

const finishLoading = initializeLoading();

ReactDOM.render(
    <CssBaseline>
        <App />
    </CssBaseline>,
    document.getElementById("root"),
    () => {
        // Aumentado o tempo de espera para garantir que o app esteja carregado
        setTimeout(finishLoading, 1000);
    }
);