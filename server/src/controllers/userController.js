import { roles } from "../config/roles.js";
import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { hashPassword } from "../utils/password.js";

async function setUserPassword(userId, newPassword) {
  const hash = await hashPassword(newPassword);
  const result = await query(
    "UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1 RETURNING id, email",
    [userId, hash]
  );
  if (!result.rowCount) throw notFound("User not found");
  // Force re-login everywhere for that user.
  await query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
  return result.rows[0];
}

// Platform admin resets any user's password (e.g. a gym owner who got locked out
// and contacted you on WhatsApp).
export const adminResetPassword = asyncHandler(async (req, res) => {
  const user = await setUserPassword(req.params.id, req.body.newPassword);
  res.json({ success: true, message: `Password reset for ${user.email}` });
});

// Gym owner resets the login password of one of their members.
export const resetMemberPassword = asyncHandler(async (req, res) => {
  const memberResult = await query(
    "SELECT user_id FROM members WHERE id = $1 AND gym_id = $2",
    [req.params.id, req.user.gym_id]
  );
  if (!memberResult.rowCount) throw notFound("Member not found");
  const userId = memberResult.rows[0].user_id;
  if (!userId) throw badRequest("This member does not have a login yet");

  const user = await setUserPassword(userId, req.body.newPassword);
  res.json({ success: true, message: `Password reset for ${user.email}` });
});

export const listGymUsers = asyncHandler(async (req, res) => {
  const result = await query(
    "SELECT id, gym_id, name, email, role, is_active, created_at FROM users WHERE gym_id = $1 ORDER BY created_at DESC",
    [req.user.gym_id]
  );
  res.json({ success: true, data: result.rows });
});

export const createGymUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = email.toLowerCase();
  const appRole = role === "trainer" ? roles.TRAINER : roles.MEMBER;

  const exists = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
  if (exists.rowCount) throw badRequest("Email is already registered");

  const passwordHash = await hashPassword(password);
  const result = await query(
    "INSERT INTO users (gym_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, gym_id, name, email, role, is_active, created_at",
    [req.user.gym_id, name, normalizedEmail, passwordHash, appRole]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});
