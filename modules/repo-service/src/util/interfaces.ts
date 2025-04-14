export interface JenkinsDeploymentRequestPayload {
  jenkinsJobName: string;
}

export interface GithubDeploymentRequestPayload {
  owner: string;
  name: string;
  workflow: string;
  branch: string;
}