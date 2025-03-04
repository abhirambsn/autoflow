import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export const useNavState = create<NavState>()(
  devtools(
    persist(
      (set) => ({
        currentPage: "",
        theme: "sap_horizon",
        layout: "Collapsed",
        setNavState: (state: Partial<NavState>) =>
          set((prev) => ({ ...prev, ...state }), undefined, {
            type: "navState/modify",
            state,
          }),
      }),
      {
        name: "navState",
      }
    ),
    {
      enabled: true,
    }
  )
);
