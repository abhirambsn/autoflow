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
      }),
      {
        name: "authState",
      }
    ),
    { enabled: true }
  )
);