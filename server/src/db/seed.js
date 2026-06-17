import { env } from "../config/env.js";
import { roles } from "../config/roles.js";
import { hashPassword } from "../utils/password.js";
import { query } from "./pool.js";
import { pool } from "./pool.js";

try {
  const existing = await query("SELECT id FROM users WHERE email = $1", [env.SEED_ADMIN_EMAIL.toLowerCase()]);
  if (existing.rowCount) {
    console.log("Seed admin already exists");
  } else {
    const passwordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);
    await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [env.SEED_ADMIN_NAME, env.SEED_ADMIN_EMAIL.toLowerCase(), passwordHash, roles.PLATFORM_ADMIN]
    );
    console.log("Seed admin created");
  }
} catch (error) {
  console.error("Seed failed", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
