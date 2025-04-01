import { Router } from "express";
import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import { Octokit } from "octokit";
import { createClient } from "redis";
import { getOrCreateRedisClient } from "../utils";

export const authRouter = Router();

let redisClient: any;

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${process.env.SELF_URL}/api/v1/auth/github/callback`,
    },
    function (
      access_token: string,
      refreshToken: string,
      profile: any,
      done: any
    ) {
      return done(null, { ...profile, accessToken: access_token });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj as any);
});

authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email", "repo", "workflow"] })
);
authRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as any;
    const payload = {
      accessToken: user?.accessToken,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    const uiUrl = process.env.UI_URL || "http://localhost:5173";
    res.redirect(
      `${uiUrl}/?token=${token}&refreshToken=${refreshToken}`
    );
  }
);

authRouter.get("/", async (req, res) => {
  redisClient = await getOrCreateRedisClient();
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const data = req.user as any;
  let grantedScopes: string[] = [];
  const key = `auth:${data?.username}`;
  const cacheData = await redisClient.get(key);
  if (cacheData) {
    grantedScopes = cacheData.split(", ");
  } else {
    try {
      const octokit = new Octokit({ auth: data.accessToken });
      const response = await octokit.request("GET /");
      grantedScopes = response.headers["x-oauth-scopes"]
        .split(", ")
        .map((s: string) => s.trim());
      await redisClient.set(key, grantedScopes.join(", "), { EX: 3600 });
    } catch (err) {
      console.error("[AUTH SVC ERROR]", err);
      res.status(401).json({ message: "Unauthorized" });
    }
  }
  const profile = {
    id: data?.id,
    displayName: data?.displayName,
    username: data?.username,
    avatarUrl: data?.photos[0]?.value,
    profileUrl: data?.profileUrl,
    permissions: grantedScopes,
  };
  console.log(profile);
  res.json(profile);
  return;
});

authRouter.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173/login");
  });
});

authRouter.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  const payload = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  res.json({ accessToken: token, refreshToken: newRefreshToken });
});
