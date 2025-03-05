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
}
