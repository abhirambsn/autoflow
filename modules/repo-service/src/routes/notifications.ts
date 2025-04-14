import { Router } from "express";
import { NotificationModel } from "../entity/notifications";
import {
  createNotification,
  parseJwt,
  deregisterClient,
  registerClient,
} from "../util";

export const notificationsRouter = Router();

notificationsRouter.post("/", async (req, res) => {
  const { jobId, message, owner, type, title } = req.body;

  if (!jobId || !message || !owner || !type || !title) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const notification = await createNotification(
    jobId,
    message,
    type,
    owner,
    title
  );

  res.status(201).json(notification);
  return;
});

notificationsRouter.get("/:owner", async (req, res) => {
  const { owner } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("event: connected\ndata: connected\n\n");

  registerClient(res, owner);

  req.on("close", () => {
    deregisterClient(res);
    res.end();
  });
});

notificationsRouter.delete("/:id", parseJwt, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  await NotificationModel.findByIdAndDelete(id);

  res.status(204).send();
  return;
});

notificationsRouter.delete("/", parseJwt, async (req, res) => {
  const { owner } = req.body;

  if (!owner) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  await NotificationModel.deleteMany({ owner });

  res.status(204).send();
  return;
});

notificationsRouter.put("/:id", parseJwt, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const notification = await NotificationModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(notification);
  return;
});
