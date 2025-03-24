import { RestEndpointMethodTypes } from "@octokit/rest";
import { hash } from "node:crypto";

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
    avatar: `https://www.gravatar.com/avatar/${hash('md5', repo.name).toString()}?d=identicon`,
  }));
