import { model, Schema } from "mongoose";

const NotificationSchema = new Schema({
  jobId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const NotificationModel = model("notifications", NotificationSchema);