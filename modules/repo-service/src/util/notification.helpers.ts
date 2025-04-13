import { NotificationModel } from "../entity/notifications";

export const createNotification = async (jobId: string, message: string, status: string) => {
    const notification = new NotificationModel({
        jobId,
        message,
        status,
    });
    
    await notification.save();
}