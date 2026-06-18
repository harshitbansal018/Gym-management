import { roles } from "../config/roles.js";
import { query, withTransaction } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addDays, sha256 } from "../utils/crypto.js";
import { badRequest, unauthorized } from "../utils/httpError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { createUniqueGymSlug } from "../utils/slug.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

function toPublicUser(user) {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

async function storeRefreshToken(userId, refreshToken) {
  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, sha256(refreshToken), addDays(7)]
  );
}

function authPayload(user, refreshToken) {
  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user),
    refreshToken
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, gymName, plan = "Starter" } = req.body;
  const normalizedEmail = email.toLowerCase();

  const exists = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
  if (exists.rowCount) throw badRequest("Email is already registered");

  const passwordHash = await hashPassword(password);

  const user = await withTransaction(async (client) => {
    const slug = await createUniqueGymSlug(client, gymName);
    const gymResult = await client.query(
      "INSERT INTO gyms (name, slug, email, subscription_plan, subscription_status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
      [gymName, slug, normalizedEmail, plan]
    );
    const gym = gymResult.rows[0];
    const userResult = await client.query(
      "INSERT INTO users (gym_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, gym_id, name, email, role, is_active, created_at",
      [gym.id, name, normalizedEmail, passwordHash, roles.GYM_OWNER]
    );

    await client.query(
      `INSERT INTO membership_plans (gym_id, name, price, duration_days, description)
       VALUES ($1, 'Basic', 1000, 30, 'Access to gym floor and lockers.'),
              ($1, 'Premium', 1500, 30, 'Trainer check-ins and group classes.'),
              ($1, 'Elite', 2500, 30, 'Personal training, diet plan, and priority booking.')`,
      [gym.id]
    );

    // Carry the gym's branding on the user so the dashboard can white-label.
    return { ...userResult.rows[0], gym_name: gym.name, gym_logo_url: gym.logo_url, gym_slug: gym.slug };
  });

  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user.id, refreshToken);

  res.status(201).json({ success: true, data: authPayload(user, refreshToken) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await query(
    `SELECT u.id, u.gym_id, u.name, u.email, u.password_hash, u.role, u.is_active, u.created_at,
            g.name AS gym_name, g.logo_url AS gym_logo_url, g.slug AS gym_slug
     FROM users u LEFT JOIN gyms g ON g.id = u.gym_id
     WHERE u.email = $1`,
    [email.toLowerCase()]
  );
  const user = result.rows[0];

  if (!user || !user.is_active) throw unauthorized("Invalid credentials");
  const passwordOk = await comparePassword(password, user.password_hash);
  if (!passwordOk) throw unauthorized("Invalid credentials");

  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user.id, refreshToken);

  res.json({ success: true, data: authPayload(user, refreshToken) });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = sha256(refreshToken);

  const tokenResult = await query(
    "SELECT id FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > now()",
    [payload.sub, tokenHash]
  );
  if (!tokenResult.rowCount) throw unauthorized("Invalid refresh token");

  const userResult = await query(
    `SELECT u.id, u.gym_id, u.name, u.email, u.role, u.is_active, u.created_at,
            g.name AS gym_name, g.logo_url AS gym_logo_url, g.slug AS gym_slug
     FROM users u LEFT JOIN gyms g ON g.id = u.gym_id
     WHERE u.id = $1`,
    [payload.sub]
  );
  const user = userResult.rows[0];
  if (!user || !user.is_active) throw unauthorized("Invalid refresh token");

  // Rotate: revoke the used refresh token and issue a fresh one so a stolen/old
  // token can't be replayed indefinitely.
  const newRefreshToken = signRefreshToken(user);
  await query("UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1", [tokenResult.rows[0].id]);
  await storeRefreshToken(user.id, newRefreshToken);

  res.json({ success: true, data: { accessToken: signAccessToken(user), refreshToken: newRefreshToken, user } });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await query("UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1", [sha256(refreshToken)]);
  }
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// Logged-in user changes their own password (must prove the current one).
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
  const user = result.rows[0];
  if (!user) throw unauthorized("Invalid session");

  const ok = await comparePassword(currentPassword, user.password_hash);
  if (!ok) throw badRequest("Current password is incorrect");

  const newHash = await hashPassword(newPassword);
  await query("UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1", [req.user.id, newHash]);

  // Revoke all existing refresh tokens so other sessions must re-authenticate.
  await query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [req.user.id]);

  res.json({ success: true, message: "Password updated" });
});
