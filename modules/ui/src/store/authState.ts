import axios from "axios";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useAuthState = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: "",
        refreshToken: "",
        user: {} as User,
        isAuthenticated: false,
        setAuthState: (state: Partial<AuthState>) =>
          set((prev) => ({ ...prev, ...state }), undefined, {
            type: "auth-state/modify",
            state,
          }),
        refreshSession: async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, {withCredentials: true});
                set((prev) => ({...prev, accessToken: response.data.accessToken, refreshToken: response.data.refreshToken}));
            } catch (error) {
                console.error("Error refreshing token", error);
            }
        },
      }),
      {
        name: "authState",
      }
    ),
    { enabled: true }
  )
);
