import { model, Schema } from "mongoose";

const NotificationSchema = new Schema({
  jobId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  owner: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["ERROR", "WARN", "SUCCESS", "INFO"],
  },
  timestamp: { type: Date, default: Date.now },
});

export const NotificationModel = model("notifications", NotificationSchema);
