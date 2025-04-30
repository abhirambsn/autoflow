import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import { authRouter } from "./routes";
import cors from "cors";
import session from "express-session";
import passport from "passport";

const app = express();

const UI_URL = process.env.NODE_ENV === "production" ? "https://autoflow.cfapps.us10-001.hana.ondemand.com" : "http://localhost:5173";

const allowedOrigins = [
  UI_URL,
  "http://localhost:5173"
];

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  }
}));
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
