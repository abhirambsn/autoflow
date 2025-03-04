import { Router } from "express";
import passport, { use } from "passport";
import { Strategy as GithubStrategy } from "passport-github2";

export const authRouter = Router();

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3000/api/v1/auth/github/callback",
    },
    function (
      access_token: string,
      refreshToken: string,
      profile: any,
      done: any
    ) {
      return done(null, profile);
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
  passport.authenticate("github", { scope: ["user:email"] })
);
authRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

authRouter.get("/", (req, res) => {
  console.log(req.user);
  const data = req.user as any;
  const profile = {
    id: data?.id,
    displayName: data?.displayName,
    username: data?.username,
    avatarUrl: data?.photos[0]?.value,
    profileUrl: data?.profileUrl,
  };
  res.json(profile);
  return;
});

authRouter.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173/login");
  });
});
