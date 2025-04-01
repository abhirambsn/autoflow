import { Router } from "express";
import { getOrCreateRedisClient, parseJwt } from "../util";
import { ModuleModel } from "../entity";
import { Octokit } from "@octokit/rest";

export const moduleRouter = Router();

let redisClient: any;

moduleRouter.post("/", parseJwt, async (req, res) => {
  try {
    const moduleCheck = await ModuleModel.findOne({
      "repo.id": req.body.repo.id,
    });
    if (moduleCheck) {
      res.status(409).json({ message: "Module already exists" });
      return;
    }
    const newModule = await ModuleModel.create(req.body);
    const octokit = new Octokit({auth: req.token});
    await octokit.repos.createWebhook({
      owner: req.body.repo.author,
      repo: req.body.repo.name,
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: `${process.env.WEBHOOK_SERVICE_URL}/api/v1/webhook`,
        content_type: "json",
        secret: process.env.WEBHOOK_SECRET,
      }
    });
    await newModule.save();
    res.status(201).json(newModule);
    return;
  } catch (err) {
    console.error("[REPO ERROR]", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
    return;
  }
});

moduleRouter.get("/:id", parseJwt, async (req, res) => {
  redisClient = await getOrCreateRedisClient();
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ message: "Module ID is required" });
      return;
    }
    const module = await ModuleModel.findOne({ id });
    if (!module) {
      res.status(404).json({ message: "Module not found" });
      return;
    }
    res.json(module);
    return;
  } catch (err) {
    console.error("[REPO ERROR]", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});

moduleRouter.get("/:ownerId/all", parseJwt, async (req, res) => {
  redisClient = await getOrCreateRedisClient();
  const { ownerId } = req.params;
  if (!ownerId) {
    res.status(400).json({ message: "Owner ID is required" });
    return;
  }
  try {
    const refresh = req.query?.refresh;
    const key = `modules:${ownerId}`;
    const cacheData = await redisClient.get(key);

    if (!cacheData || refresh) {
      const modules = await ModuleModel.find({ ownerId });
      await redisClient.set(key, JSON.stringify(modules), { EX: 3600 });
      res.json(modules);
      return;
    } else {
      res.json(JSON.parse(cacheData));
      return;
    }
  } catch (err) {
    console.error("[REPO ERROR]", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});
