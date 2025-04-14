import { Router } from "express";
import { getOrCreateRedisClient } from "../util";
import { CommitsModel, ModuleModel } from "../entity";

let redisClient: any;

export const commitRouter = Router();

commitRouter.post("/", async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      res.status(400).json({ message: "Request body is required" });
      return;
    }
    const commit = await CommitsModel.create(body);
    await commit.save();
    res.status(201).json({ created: true, commit });
    return;
  } catch (err) {
    console.error("[REPO ERROR]", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
    return;
  }
});

commitRouter.get("/:repoId", async (req, res) => {
  try {
    const repoId = req.params.repoId;
    if (!repoId) {
      res.status(400).json({ message: "Repository ID is required" });
      return;
    }
    redisClient = await getOrCreateRedisClient();
    const key = `commits:${repoId}:${req.token?.slice(5, 9)}`;
    const cacheData = await redisClient.get(key);
    const refresh = req.query.refresh;
    let commitData;
    if (!cacheData || refresh) {
      commitData = await CommitsModel.find({ repoId });
      const module = await ModuleModel.findOne({
        "repo.id": repoId,
      });
      if (!module) {
        res.status(404).json({ message: "Module not found" });
        return;
      }
      const combinedData = commitData.map((commit) => {
        const doc = commit.toObject();
        return {
          ...doc,
          module: {
            id: module.id,
            name: module.name,
          },
        };
      });
      await redisClient.set(key, JSON.stringify(combinedData));
      commitData = combinedData;
    } else {
      commitData = JSON.parse(cacheData);
    }
    res.status(200).json(commitData);
    return;
  } catch (error) {
    console.error("[REPO ERROR]", error);
    res.status(500).json({ message: "Internal Server Error", error });
    return;
  }
});
