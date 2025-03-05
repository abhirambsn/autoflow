import { NavigationLayout } from "@ui5/webcomponents-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";
import { useAuthState, useNavState } from "./store";
import { ThemeContextProvider } from "./context/ThemeContext";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { useCallback, useEffect } from "react";
import axios from "axios";
// import OnboardingWizardDialog from "./components/OnboardingWizardDialog";

function App() {
  const navState = useNavState();
  const authState = useAuthState();
  const setAuthState = useAuthState((state) => state.setAuthState);
  const refreshSession = useAuthState((state) => state.refreshSession);
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

  // const openOnboardingWizard = useCallback(() => {
  //   console.log("Opening onboarding wizard...");
  //   setOnboardingWizardOpen(true);
  // }, [setOnboardingWizardOpen]);

  // const closeOnboardigWizard = useCallback(() => {
  //   setOnboardingWizardOpen(false);
  // }, [setOnboardingWizardOpen]);

  // useEffect(() => {
  //   document.addEventListener("onboard-repo", openOnboardingWizard);

  //   return () =>
  //     document.removeEventListener("onboard-repo", openOnboardingWizard);
  // });

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
    }
  }, [authState, setAuthState]);

  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  useEffect(() => {
    (async () => {
      await setTheme("sap_horizon_dark");
    })();
  }, []);

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
