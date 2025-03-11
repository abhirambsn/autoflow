import './App.css'
import { NavigationLayout } from "@ui5/webcomponents-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Outlet, useNavigate } from "react-router";
import { useAuthState, useNavState } from "./store";
import { ThemeContextProvider } from "./context/ThemeContext";
import { useCallback, useEffect } from "react";
import axios from "axios";

function App() {
  const navState = useNavState();
  const authState = useAuthState();
  const setAuthState = useAuthState((state) => state.setAuthState);
  const refreshSession = useAuthState((state) => state.refreshSession);
  const navigate = useNavigate();
  // const [onboardingWizardOpen, setOnboardingWizardOpen] = useState(false);

  const toggleSidebar = () => {
    navState.setNavState({
      layout: navState.layout === "Collapsed" ? "Expanded" : "Collapsed",
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSession();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshSession]);

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
        setAuthState({ user: res.data, isAuthenticated: true });
      }
    } catch (err) {
      console.error("[AUTH ERROR]", err);
      setAuthState({ isAuthenticated: false, user: {} as User });
      navigate("/login");
    }
  }, [authState, setAuthState, navigate]);

  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    const refreshToken = new URLSearchParams(window.location.search).get(
      "refresh_token"
    );
    if (token) {
      setAuthState({ accessToken: token });
    }
    if (refreshToken) {
      setAuthState({ refreshToken });
    }
  }, [setAuthState]);

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
