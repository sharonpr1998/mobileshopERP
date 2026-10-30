
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "@/models/user.model.js";
import { env } from "@/config/env.js";

export const authenticate: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token = authorization.slice(7);
    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    const user = await User.findById(decoded.sub).select("_id status");

    if (!user || user.status !== "active") {
      res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
      return;
    }

    res.locals.userId = user._id.toString();
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
