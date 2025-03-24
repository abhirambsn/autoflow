import axios from "axios";

export class RepositoryService {
  private url: string = import.meta.env.VITE_GH_API_URL as string;

  async getRepositories(access_token: string, refresh?: boolean) {
    try {
      let url = `${this.url}/api/v1/repositories`;
      if (refresh) {
        url += "?refresh=true";
      }
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return res.data;
    } catch (err) {
      console.error("[REPO SVC ERROR]", err);
      return [];
    }
  }

  async getRepoBranches(access_token: string, repoId: string, owner: string) {
    const url = `${this.url}/api/v1/repositories/${repoId}/${owner}/branches`;
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return res.data;
    } catch (err) {
      console.error("[REPO SVC ERROR]", err);
      return [];
    }
  }
}
