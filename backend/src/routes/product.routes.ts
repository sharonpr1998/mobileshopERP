import { Router } from "express";

import productController from "@/controllers/product.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { createProductSchema } from "@/validators/product.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("inventory", "create", "master"),
  validate(createProductSchema),
  productController.create.bind(productController),
);

router.get(
  "/",
  authenticate,
  authorize("inventory", "read", "master"),
  productController.getAll.bind(productController),
);

router.put(
  "/:id",
  authenticate,
  authorize("inventory", "update", "master"),
  validate(createProductSchema),
  productController.update.bind(productController),
);

router.delete(
  "/:id",
  authenticate,
  authorize("inventory", "delete", "master"),
  productController.delete.bind(productController),
);

export default router;