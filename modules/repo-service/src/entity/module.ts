import { model, Schema } from "mongoose";
import { randomUUID } from "node:crypto";

const RepoSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  full_name: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ["private", "public"] },
});

const ModuleSchema = new Schema({
  id: { type: String, required: true, default: randomUUID() },
  name: { type: String, required: true },
  description: { type: String, required: true },
  version: { type: String, required: true },
  repo: RepoSchema,
  workflowType: {
    type: String,
    required: true,
    enum: ["github", "jenkins", "none"],
  },
  hasDockerfile: { type: Boolean, required: true },
  hasKubernetes: { type: Boolean, required: true },
  hasDockerCompose: { type: Boolean, required: true },
  hasPipeline: { type: Boolean, required: true },
  requiresDockerfile: { type: Boolean, required: true },
  requiresKubernetes: { type: Boolean, required: true },
  requiresDockerCompose: { type: Boolean, required: true },
  requiresPipeline: { type: Boolean, required: true },
  branch: { type: String, required: true },
  otherRequirements: { type: String },
  email: { type: String, required: true },
});

export const ModuleModel = model("modules", ModuleSchema);
