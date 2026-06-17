import { Router } from "express";
import { adminRoutes } from "./adminRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { memberRoutes } from "./memberRoutes.js";
import { ownerRoutes } from "./ownerRoutes.js";
import { publicRoutes } from "./publicRoutes.js";
import { trainerRoutes } from "./trainerRoutes.js";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/public", publicRoutes);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/owner", ownerRoutes);
apiRoutes.use("/trainer", trainerRoutes);
apiRoutes.use("/member", memberRoutes);
