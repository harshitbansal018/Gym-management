import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),
  SEED_ADMIN_NAME: z.string().default("Platform Admin"),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@fitmanager.in"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("Admin@123456"),
  // Your platform's WhatsApp number (intl format, no '+', e.g. 919876543210) that
  // gym owners contact to pay you and get activated. Optional UPI QR image URL.
  PLATFORM_WHATSAPP: z.string().default(""),
  PLATFORM_UPI_QR_URL: z.string().default("")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
};
