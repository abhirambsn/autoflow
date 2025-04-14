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
  refreshSession: () => Promise<void>;
}

declare interface NotificationState {
  notifications: NotificationMessage[];
  addNotification: (notification: NotificationMessage) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setNotifications: (notifications: NotificationMessage[]) => void;
}

declare interface Repo {
  id: string;
  name: string;
  full_name: string;
  author: string;
  description: string;
  url: string;
  type: string;
  avatar: string;
}

declare interface RepoState {
  repos: Repo[];
  onboardedRepos: ModuleData[];
  setRepoState: (state: Partial<RepoState>) => void;
}

declare interface User {
  displayName: string;
  username: string;
  avatarUrl: string;
  profileUrl: string;
  permissions: string[];
  id: string;
}

declare interface SidebarLink {
  title: string;
  icon: string;
  type: "action" | "link";
  action?: () => void;
  href?: string;
}

declare interface ModuleData {
  id?: string;
  name: string;
  description: string;
  version: string;
  repo: Repo;
  workflowType: "github" | "jenkins" | "none";
  hasDockerfile: boolean;
  hasKubernetes: boolean;
  hasDockerCompose: boolean;
  hasPipeline: boolean;
  requiresDockerfile: boolean;
  requiresKubernetes: boolean;
  requiresDockerCompose: boolean;
  requiresPipeline: boolean;
  branch: string;
  otherRequirements?: string;
  email: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

declare interface CommitRecord {
  commitId: string;
  message: string;
  author: string;
  email: string;
  link: string;
  commitTime: string;
  branch: string;
  repoId: string;
  module: {
    id: string;
    name: string;
  }
  createdAt?: string;
  updatedAt?: string;
}

declare interface Message {
  type: "success" | "error" | "warning";
  message: string;
}

declare interface NotificationMessage {
  _id: string;
  jobId: string;
  title: string;
  message: string;
  status: string;
  owner: string;
  type: "ERROR" | "WARN" | "SUCCESS" | "INFO";
  timestamp: string;
}