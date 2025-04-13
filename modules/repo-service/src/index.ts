import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { commitRouter, moduleRouter, repoRouter } from "./routes";
import mongoose from "mongoose";
import cors from "cors";

declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
}

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/repositories", repoRouter);
app.use('/api/v1/modules', moduleRouter);
app.use('/api/v1/commits', commitRouter);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI as string, {}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
