import { model, Schema } from "mongoose";

const CommitSchema = new Schema(
  {
    commitId: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String, required: true },
    email: { type: String, required: true },
    link: { type: String, required: true },
    commitTime: { type: Date, required: true },
    branch: { type: String, required: true },
    repoId: { type: String, required: true },
  },
  { timestamps: true }
);

export const CommitsModel = model("commits", CommitSchema);
