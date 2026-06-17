import { Router } from "express";
import { env } from "../config/env.js";
import { getPublicGymBySlug } from "../controllers/gymController.js";

export const publicRoutes = Router();

// Platform contact details for the owner "pending activation" screen.
publicRoutes.get("/platform", (_req, res) => {
  res.json({
    success: true,
    data: { whatsapp: env.PLATFORM_WHATSAPP, upiQrUrl: env.PLATFORM_UPI_QR_URL }
  });
});

publicRoutes.get("/gyms/:slug", getPublicGymBySlug);
