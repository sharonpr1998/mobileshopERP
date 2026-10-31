
import { Router } from "express";

import userController from "@/controllers/user.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";

import {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from "@/validators/user.validator.js";

const router = Router();

router.use(authenticate);

// Create Staff
router.post(
  "/staff",
  authorize("staff", "create", "master"),
  validate(createStaffSchema),
  userController.createStaff,
);

// Get All Staff
router.get(
  "/staff",
  authorize("staff", "read", "master"),
  userController.getAllStaff,
);

// Update Staff Details
router.patch(
  "/staff/:id",
  authorize("staff", "update", "master"),
  validate(updateStaffSchema),
  userController.updateStaff,
);

// Activate / Deactivate Staff
router.patch(
  "/staff/:id/status",
  authorize("staff", "update", "master"),
  validate(updateStaffStatusSchema),
  userController.updateStaffStatus,
);

export default router;
