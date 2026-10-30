import { Router } from "express";
import categoryController from "@/controllers/category.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { authorize } from "@/middlewares/permission.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { createCategorySchema } from "@/validators/category.validator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("inventory", "create", "master"),
  validate(createCategorySchema),
  categoryController.create.bind(categoryController),
);

router.get(
  "/",
  authorize("inventory", "read", "master"),
  categoryController.getAll.bind(categoryController),
);

router.patch(
  "/:id",
  authorize("inventory", "update", "master"),
  validate(createCategorySchema),
  categoryController.update.bind(categoryController),
);

router.delete(
  "/:id",
  authorize("inventory", "delete", "master"),
  categoryController.delete.bind(categoryController),
);

export default router;