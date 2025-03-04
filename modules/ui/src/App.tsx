import { NavigationLayout } from "@ui5/webcomponents-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";
import { useAuthState, useNavState } from "./store";
import { ThemeContextProvider } from "./context/ThemeContext";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { useCallback, useEffect } from "react";
import axios from "axios";

function App() {
  const navState = useNavState();
  const authState = useAuthState();

  const toggleSidebar = () => {
    navState.setNavState({
      layout: navState.layout === "Collapsed" ? "Expanded" : "Collapsed",
    });
  };

  const getUserDetails = useCallback(async () => {
    if (Object.keys(authState.user).length > 0) return;
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/api/v1/auth/",
        {
          withCredentials: true,
        }
      );
      if (res.data) {
        authState.setAuthState({ user: res.data, isAuthenticated: true });
      }
    } catch (err) {
      console.error('[AUTH ERROR]', err);
      authState.setAuthState({ isAuthenticated: false, user: {} as User });
    }
  }, [authState]);

  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  useEffect(() => {
    (async () => {
      await setTheme("sap_horizon_dark");
    })();
  }, []);

  return (
    <ThemeContextProvider>
      <NavigationLayout
        mode={navState.layout}
        header={<Navbar toggleSidebar={toggleSidebar} />}
        sideContent={<Sidebar />}
      >
        <div style={{ padding: "1rem" }}>
          <Outlet />
        </div>
      </NavigationLayout>
    </ThemeContextProvider>
  );
}

export default App;
