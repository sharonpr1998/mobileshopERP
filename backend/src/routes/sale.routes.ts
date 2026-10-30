import { Router } from "express";

import saleController from "../controllers/sale.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSaleSchema } from "../validators/sale.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("sales", "create", "transaction"),
  validate(createSaleSchema),
  saleController.create.bind(saleController),
);

router.get(
  "/",
  authenticate,
  authorize("sales", "read", "transaction"),
  saleController.getAll.bind(saleController),
);

export default router;