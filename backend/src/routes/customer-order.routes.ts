import { Router } from "express";

import customerOrderController from "@/controllers/customer-order.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/my-orders",
  authenticate,
  customerOrderController.getMyOrders,
);

export default router;