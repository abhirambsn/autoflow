import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { authRouter } from "./routes";
import cors from "cors";
import session from "express-session";
import passport from "passport";

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true, cookie: {secure: false} }));

app.get("/", (req, res) => {
  res.json({ message: "ok" });
  return;
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", authRouter);

mongoose.connect(process.env.MONGO_URI as string, {}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
