import axios from "axios";

export class DeploymentService {
  private url: string = import.meta.env.VITE_API_URL as string;

  async triggerDeployment(access_token: string, type: string, config: any) {
    const url = `${this.url}/api/v1/deployments/`;
    const res = await axios.post(
      url,
      { type, ...config },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  }

  async getDeploymentStatus(access_token: string, type: string, config: any) {
    const params: any = { type };
    if (type === "github") {
      params.repo = config.repo;
      params.runId = config.runId;
    } else {
      params.job = config.jenkinsJobName;
      params.buildNumber = config.buildNumber;
    }

    const url = `${this.url}/api/v1/deployments/status`;
    const res = await axios.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return res.data;
  }

  async getGithubDeploymentOptions(access_token: string, repo_id: string, refresh: boolean) {
    let url = `${this.url}/api/v1/deployments/${repo_id}`;
    if (refresh) {
      url += "?refresh=true";
    }
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  }
}
