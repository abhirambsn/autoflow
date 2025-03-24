import express from "express";
import dotenv from "dotenv";
import { moduleRouter, repoRouter } from "./routes";
import mongoose from "mongoose";
import cors from "cors";

declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
}

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/repositories", repoRouter);
app.use('/api/v1/modules', moduleRouter);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI as string, {}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
