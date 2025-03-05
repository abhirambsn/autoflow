import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useRepoState = create<RepoState>()(
  devtools(
    persist(
      (set) => ({
        repos: [],
        onboardedRepos: [],
        setRepoState: (state: Partial<RepoState>) =>
          set((prev) => ({ ...prev, ...state }), undefined, {
            type: "repoState/modify",
            state,
          }),
      }),
      {
        name: "repoState",
      }
    ),
    { enabled: true }
  )
);
