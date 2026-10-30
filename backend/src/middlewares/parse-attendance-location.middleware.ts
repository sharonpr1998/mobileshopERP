import type {
  Request,
  Response,
  NextFunction,
} from "express";

export function parseAttendanceLocation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (typeof req.body.location === "string") {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid location data",
      });
      return;
    }
  }

  next();
}