import { Router } from "express";
import {
  getGithubDeploymentStatus,
  getOrCreateRedisClient,
  parseJwt,
  triggerGithubDeployment,
  triggerJenkinsDeployment,
} from "../util";
import { randomUUID } from "node:crypto";
import { Octokit } from "@octokit/rest";
import { createNotification } from "../util";

export const deploymentRouter = Router();

let redisClient: any;

deploymentRouter.get("/:owner/:repoName", parseJwt, async (req, res) => {
  const { owner, repoName } = req.params;
  redisClient = await getOrCreateRedisClient();

  const cacheKey = `deployment:workflows:${owner}:${repoName}`;
  const cacheData = await redisClient.get(cacheKey);
  const refresh = req.query.refresh;
  let workflows;

  if (!cacheData || refresh) {
    try {
      const octokit = new Octokit({ auth: req.token });
      const response = await octokit.rest.actions.listRepoWorkflows({
        owner,
        repo: repoName,
      });
      workflows = response.data.workflows;
      await redisClient.set(cacheKey, JSON.stringify(workflows), { EX: 3600 });
    } catch (err) {
      console.error("[DEPLOYMENT ERROR]", err);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  } else {
    workflows = JSON.parse(cacheData);
  }

  res.json(workflows);
});

deploymentRouter.post("/", parseJwt, async (req, res) => {
  const { type, repo, branch, workflow, jenkinsJob } = req.body;
  try {
    const octokit = new Octokit({ auth: req.token });

    if (type === "github") {
      const [owner, name] = repo.split("/");
      const result = await triggerGithubDeployment(octokit, {
        owner,
        name,
        branch,
        workflow,
      });
      createNotification(
        randomUUID(),
        `Github Workflow Deployment triggered for ${repo} on branch ${branch}`,
        "INFO",
        owner,
        "Deployment Triggered"
      );
      res.json({ runId: result.id });
    } else if (type === "jenkins") {
      await triggerJenkinsDeployment({ jenkinsJobName: jenkinsJob });
    } else {
      res.status(400).json({ error: "Invalid deployment type" });
    }
  } catch (err) {
    console.error("[DEPLOYMENT ERROR]", err);
    createNotification(
      randomUUID(),
      `Deployment failed with error: ${err}`,
      "ERROR",
      req.body.owner,
      "Deployment Error"
    );
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});

deploymentRouter.get("/status", parseJwt, async (req, res) => {
  const { type, runId, repo, job, buildNumber } = req.query;

  try {
    if (type === "github") {
      if (!repo || !runId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      const [owner, name] = repo?.toString().split("/");
      const octokit = new Octokit({ auth: req.token });
      const status = await getGithubDeploymentStatus(
        octokit,
        owner,
        name,
        Number(runId as string)
      );
      res.json(status);
    } else if (type === "jenkins") {
      if (!job || !buildNumber) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      // const status = await getJenkinsDeploymentStatus(job, buildNumber);
      // res.json(status);
      res
        .status(501)
        .json({ error: "Jenkins deployment status not implemented" });
    } else {
      res.status(400).json({ error: "Invalid deployment type" });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
});
