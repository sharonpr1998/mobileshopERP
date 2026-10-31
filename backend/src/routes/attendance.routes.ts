
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

router.use(authenticate);

// Staff: Own attendance history
router.get(
  "/my",
  authorize("attendance", "read", "transaction"),
  attendanceController.getMyAttendance.bind(attendanceController),
);

// Super Admin: All attendance records
router.get(
  "/",
  authorize("attendance", "read", "transaction"),
  attendanceController.getAll.bind(attendanceController),
);

// Staff: Check-in
router.post(
  "/check-in",
  authorize("attendance", "create", "transaction"),
  uploadSelfie.single("selfie"),
  parseAttendanceLocation,
  validate(checkInSchema),
  attendanceController.checkIn.bind(attendanceController),
);

// Staff: Check-out
router.patch(
  "/check-out",
  authorize("attendance", "update", "transaction"),
  uploadSelfie.single("selfie"),
  parseAttendanceLocation,
  validate(checkOutSchema),
  attendanceController.checkOut.bind(attendanceController),
);

export default router;
