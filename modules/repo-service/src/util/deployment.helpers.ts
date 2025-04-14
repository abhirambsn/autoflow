import { Octokit } from "@octokit/rest";
import {
  GithubDeploymentRequestPayload,
  JenkinsDeploymentRequestPayload,
} from "./interfaces";
import { createNotification } from "./notification.helpers";

export async function triggerGithubDeployment(
  octokit: Octokit,
  payload: GithubDeploymentRequestPayload
) {
  const { owner, name, workflow, branch } = payload;
  await octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo: name,
    workflow_id: workflow,
    ref: branch,
  });

  const runs = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo: name,
    workflow_id: workflow,
    branch,
    per_page: 1,
  });

  if (runs.data.workflow_runs.length === 0) {
    throw new Error("No workflow runs found after dispatch");
  }

  return runs.data.workflow_runs[0];
}

export async function getGithubDeploymentStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  runId: number
) {
  const response = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: runId,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to get deployment status: ${response.status}`);
  }

  if (response.data.status === "completed") {
    const owner = repo.split("/")[0];
    if (response.data.conclusion === "failure") {
        createNotification(
            runId.toString(),
            `Deployment failed for workflow run ${runId}, check detailed logs at ${response.data.html_url}`,
            "ERROR",
            owner,
            "Deployment Failed"
        );
    } else if (response.data.conclusion === "success") {
        createNotification(
            runId.toString(),
            `Deployment succeeded for workflow run ${runId}, check detailed logs at ${response.data.html_url}`,
            "SUCCESS",
            owner,
            "Deployment Succeeded"
        );
    }
  }

  return {
    id: response.data.id,
    status: response.data.status,
    conclusion: response.data.conclusion,
    html_url: response.data.html_url,
    workflow_title: response.data.display_title,
    workflow_id: response.data.workflow_id,
    started_at: response.data.run_started_at,
    updated_at: response.data.updated_at,
  };
}

export async function triggerJenkinsDeployment(
  payload: JenkinsDeploymentRequestPayload
) {
  console.log("Triggering Jenkins deployment with payload:", payload);
  throw new Error("Jenkins deployment is not implemented yet");
}

export async function getJenkinsDeploymentStatus(
  job: string,
  buildNumber: string
) {
  // const url = `${JENKINS_BASE}/job/${job}/${buildNumber}/api/json`;
  // const response = await axios.get(url, { auth });
  // return response.data;
  console.log(
    "Getting Jenkins deployment status for job:",
    job,
    "build number:",
    buildNumber
  );
  throw new Error("Jenkins deployment status is not implemented yet");
}
