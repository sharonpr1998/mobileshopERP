import { Router } from "express";

import customerProfileController from "@/controllers/customer-profile.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/my-profile",
  authenticate,
  customerProfileController.getMyProfile,
);

router.patch(
  "/my-profile",
  authenticate,
  customerProfileController.updateMyProfile,
);

export default router;