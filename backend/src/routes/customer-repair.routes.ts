import { Router } from "express";

import customerRepairController from "@/controllers/customer-repair.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/my-repairs",
  authenticate,
  customerRepairController.getMyRepairs,
);

export default router;