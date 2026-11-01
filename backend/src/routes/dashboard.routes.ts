
import { Router } from "express";

import { authenticate } from "@/middlewares/auth.middleware.js";
import dashboardController from "@/controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", dashboardController.getDashboard);

export default router;
