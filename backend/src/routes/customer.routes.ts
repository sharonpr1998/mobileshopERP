import { Router } from "express";

import customerController from "@/controllers/customer.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { createCustomerSchema } from "@/validators/customer.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("customer", "create", "master"),
  validate(createCustomerSchema),
  customerController.create,
);

router.get(
  "/",
  authenticate,
  authorize("customer", "read", "master"),
  customerController.getAll,
);

export default router;