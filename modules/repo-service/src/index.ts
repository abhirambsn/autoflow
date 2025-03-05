import express from "express";
import dotenv from "dotenv";
import { repoRouter } from "./routes";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/repositories", repoRouter);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI as string, {}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
