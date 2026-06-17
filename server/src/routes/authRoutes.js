import { Router } from "express";
import { changePassword, login, logout, me, refresh, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { changePasswordValidator, loginValidator, refreshValidator, registerValidator } from "../validators/authValidators.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidator, validate, register);
authRoutes.post("/login", loginValidator, validate, login);
authRoutes.post("/refresh", refreshValidator, validate, refresh);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authenticate, me);
authRoutes.post("/change-password", authenticate, changePasswordValidator, validate, changePassword);
