declare interface NavState {
    currentPage: string;
    theme: string;
    layout: "Collapsed" | "Expanded" | "Auto";
    setNavState: (state: Partial<NavState>) => void;
}

declare interface AuthState {
    accessToken: string;
    refreshToken: string;
    user: User;
    isAuthenticated: boolean;
    setAuthState: (state: Partial<AuthState>) => void;
}

declare interface User {
    displayName: string;
    username: string;
    avatarUrl: string;
    profileUrl: string;
}