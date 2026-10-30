import { Router } from "express";

import repairController from "@/controllers/repair.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import {
  createRepairSchema,
  updateRepairStatusSchema,
} from "@/validators/repair.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("repair", "create", "transaction"),
  validate(createRepairSchema),
  repairController.create,
);

router.get(
  "/",
  authenticate,
  authorize("repair", "read", "transaction"),
  repairController.getAll,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("repair", "update", "transaction"),
  validate(updateRepairStatusSchema),
  repairController.updateStatus,
);

export default router;