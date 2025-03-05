import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@ui5/webcomponents-react";
import { BrowserRouter, Route, Routes } from "react-router";

import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import "@ui5/webcomponents-icons-tnt/dist/AllIcons.js";
import "@ui5/webcomponents-icons-business-suite/dist/AllIcons.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";
import "@sap-ui/common-css/dist/sap-content-paddings.css";
import "@sap-ui/common-css/dist/sap-container-type.css";
import "@ui5/webcomponents-react/dist/themes/sap_horizon_dark.css";
import "@ui5/webcomponents-react/dist/themes/sap_horizon.css";

// Pages
import { HomePage, RepositoriesPage } from "@/pages";
import LoginPage from "./pages/LoginPage.tsx";
import OnboardRepositoryPage from "./pages/OnboardRepositoryPage.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="page1" element={<div>Page 1</div>} />
          <Route path="page2" element={<div>Page 2</div>} />
          <Route path="repositories" element={<RepositoriesPage />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="onboard" element={<OnboardRepositoryPage />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);
