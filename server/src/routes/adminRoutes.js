import { Router } from "express";
import { roles } from "../config/roles.js";
import { platformDashboard } from "../controllers/dashboardController.js";
import { listGyms, updateGymSubscription } from "../controllers/gymController.js";
import { adminResetPassword } from "../controllers/userController.js";
import { query } from "../db/pool.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { resetPasswordValidator } from "../validators/authValidators.js";
import { gymSubscriptionValidator, uuidParam } from "../validators/gymValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(roles.PLATFORM_ADMIN));

adminRoutes.get("/dashboard", platformDashboard);
adminRoutes.get("/gyms", listGyms);
adminRoutes.patch("/gyms/:id", uuidParam(), gymSubscriptionValidator, validate, updateGymSubscription);
adminRoutes.get("/users", asyncHandler(async (_req, res) => {
  const result = await query("SELECT id, gym_id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
  res.json({ success: true, data: result.rows });
}));
adminRoutes.post("/users/:id/reset-password", uuidParam(), resetPasswordValidator, validate, adminResetPassword);
adminRoutes.get("/payments", asyncHandler(async (_req, res) => {
  const result = await query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 100");
  res.json({ success: true, data: result.rows });
}));
