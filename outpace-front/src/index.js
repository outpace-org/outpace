import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { registerLicense } from "@syncfusion/ej2-base";

import "./stylesheet.css";

import AppRouter from "./router/AppRouter";
import reducers from "./reducers";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NAaF1cXmhLYVJxWmFZfVpgc19FZVZSTGYuP1ZhSXxXdkdiWX9Zc3FWTmNdVUU=",
);

ReactDOM.render(
  <Provider
    store={createStore(
      reducers,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__(),
    )}
  >
    <AppRouter />
  </Provider>,
  document.getElementById("root"),
);
