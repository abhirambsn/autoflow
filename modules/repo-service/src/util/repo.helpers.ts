import { RestEndpointMethodTypes } from "@octokit/rest";

export const parseRepoData = (
  resp: RestEndpointMethodTypes["repos"]["listForAuthenticatedUser"]["response"]
) =>
  resp.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    author: repo.owner.login,
    description: repo.description,
    url: repo.html_url,
    type: repo.visibility,
  }));
