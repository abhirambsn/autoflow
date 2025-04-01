import { Router } from 'express';
import { RepoService } from '../service/repo.service';

const repoService = new RepoService(process.env.REPO_SERVICE_URL as string);
export const webhookRouter = Router();

webhookRouter.post("/", async (req, res) => {
    const { body } = req;
    try {
        await repoService.createCommitRecord(body);
        res.status(200).json({ message: "ok" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    return;
});