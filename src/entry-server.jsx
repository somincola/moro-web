import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";

export function render(path) {
  return renderToString(
    <React.StrictMode>
      <App path={path} />
    </React.StrictMode>,
  );
}

export { ROUTES, NOT_FOUND, SITE_URL, APP_STORE_ID, OG_IMAGE } from "./seo.js";
