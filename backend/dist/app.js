import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env.js";
import authRoutes from "@/routes/auth.routes.js";
import testRoutes from "@/routes/test.routes.js";
import categoryRoutes from "@/routes/category.routes.js";
import productRoutes from "@/routes/product.routes.js";
import stockMovementRoutes from "./routes/stock-movement.routes.js";
import purchaseRoutes from "@/routes/purchase.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import customerRoutes from "@/routes/customer.routes.js";
import repairRoutes from "@/routes/repair.routes.js";
import attendanceRoutes from "@/routes/attendance.routes.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import rbacRoutes from "@/routes/rbac.routes.js";
const app = express();
app.use(helmet());
app.use(cors({
    origin: env.frontendUrl,
    credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/rbac", authenticate, rbacRoutes);
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Mobile Shop ERP API is running",
    });
});
export default app;
