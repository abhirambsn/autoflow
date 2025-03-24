import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function parseJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ message: "Forbidden", error: err });
      return;
    }

    req.token = decoded.accessToken;
    next();
  });
};