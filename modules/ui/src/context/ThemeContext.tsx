import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextValue {
  theme: "sap_horizon" | "sap_horizon_dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "sap_horizon_dark",
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
};

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const initTheme = (localStorage.getItem("ui5-theme") || "sap_horizon") as
    | "sap_horizon"
    | "sap_horizon_dark";
  const [currentTheme, setCurrentTheme] = useState<
    "sap_horizon" | "sap_horizon_dark"
  >(initTheme);

  useEffect(() => {
    console.log("Setting theme to", currentTheme);
    localStorage.setItem("ui5-theme", currentTheme);
    void setTheme(currentTheme);
    console.log("Theme changed to", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) =>
      prev === "sap_horizon" ? "sap_horizon_dark" : "sap_horizon"
    );
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
