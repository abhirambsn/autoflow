import { NextFunction, Request, Response, Router } from "express";
import { Octokit } from "@octokit/rest";
import jwt from "jsonwebtoken";
import { createClient, RedisClientType } from "redis";
import { parseRepoData } from "../util";

declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
}

let redisClient: any;

createClient({
  url: process.env.REDIS_URL,
})
  .on("error", (err) => console.error("[REDIS ERROR]", err))
  .connect()
  .then((client) => {
    redisClient = client;
  });

const parseJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ message: "Forbidden", error: err });
      return;
    }

    req.token = decoded.accessToken;
    next();
  });
};

export const repoRouter = Router();

repoRouter.get("/", parseJwt, async (req, res) => {
  try {
    const octokit = new Octokit({ auth: req.token });
    const key = `repos:${req.token?.slice(5, 9)}`;
    const cacheData = await redisClient.get(key);
    const refresh = req.query.refresh;
    let repoData;
    if (!cacheData || refresh) {
      const resp = await octokit.repos.listForAuthenticatedUser({
        visibility: "all",
        per_page: 100,
      });
      const data = parseRepoData(resp);
      repoData = data;
      await redisClient.set(key, JSON.stringify(repoData), { EX: 3600 });
    } else {
      repoData = JSON.parse(cacheData);
    }
    res.json(repoData);
    return;
  } catch (err) {
    console.error("[REPO ERROR]", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});

repoRouter.get("/:repoId/:owner/branches", parseJwt, async (req, res) => {
  const cacheKey = `branches:${req.params.repoId}`;
  const cacheData = await redisClient.get(cacheKey);
  if (cacheData) {
    res.json(JSON.parse(cacheData));
    return;
  }

  try {
    const octokit = new Octokit({ auth: req.token });
    const resp = await octokit.repos.listBranches({
      repo: req.params.repoId,
      owner: req.params.owner,
    });
    const data = resp.data.map((branch) => branch.name);
    await redisClient.set(cacheKey, JSON.stringify(data), { EX: 3600 });
    res.json(data);
    return;
  } catch (err) {
    console.error("[REPO ERROR]", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});
