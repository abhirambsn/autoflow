import { NotificationModel } from "../entity/notifications";
import { broadcast } from "./sse.helpers";

export const createNotification = async (
  jobId: string,
  message: string,
  type: string,
  owner: string,
  title: string
) => {
  const notification = await NotificationModel.create({
    jobId,
    message,
    status: "NEW",
    type,
    owner,
    title,
  });

  broadcast(notification);
  return notification;
};
