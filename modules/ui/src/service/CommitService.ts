import axios from "axios";

export class CommitService {
    private url: string = import.meta.env.VITE_GH_API_URL as string;
    
      async getCommits(access_token: string, repoId: string, refresh?: boolean) {
        let url = `${this.url}/api/v1/commits/${repoId}`;
        if (refresh) {
          url += "?refresh=true";
        }
        try {
          const res = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
          return res.data;
        } catch (err) {
          console.error("[REPO SVC ERROR]", err);
          throw err;
        }
    }
}