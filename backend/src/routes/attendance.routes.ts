import { Router } from "express";

import attendanceController from "@/controllers/attendance.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import uploadSelfie from "@/middlewares/upload-selfie.middleware.js";
import {
  checkInSchema,
  checkOutSchema,
} from "@/validators/attendance.validator.js";
import {
  parseAttendanceLocation,
} from "@/middlewares/parse-attendance-location.middleware.js";

const router = Router();

router.post(
  "/check-in",
  authenticate,
  authorize("attendance", "create", "transaction"),
  uploadSelfie.single("selfie"),
  parseAttendanceLocation,
  validate(checkInSchema),
  attendanceController.checkIn,
);

router.patch(
  "/check-out",
  authenticate,
  authorize("attendance", "update", "transaction"),
  uploadSelfie.single("selfie"),
  parseAttendanceLocation,
  validate(checkOutSchema),
  attendanceController.checkOut,
);

router.get(
  "/",
  authenticate,
  authorize("attendance", "read", "transaction"),
  attendanceController.getAll,
);

export default router;