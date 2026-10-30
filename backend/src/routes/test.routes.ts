
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";

const router = Router();

router.get(
  "/inventory",
  authenticate,
  authorize("inventory", "read", "master"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Inventory access granted",
    });
  }
);

export default router;
