import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { forbidden, unauthorized } from "../utils/httpError.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) throw unauthorized("Missing access token");

    const payload = verifyAccessToken(token);
    const result = await query(
      "SELECT id, name, email, role, gym_id, is_active FROM users WHERE id = $1",
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) throw unauthorized("Invalid access token");

    req.user = user;
    next();
  } catch (error) {
    next(unauthorized(error.message === "Missing access token" ? error.message : "Invalid or expired access token"));
  }
}

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!allowedRoles.includes(req.user.role)) return next(forbidden("You do not have permission to access this resource"));
    return next();
  };
}

export function requireGymAccess(req, _res, next) {
  if (!req.user?.gym_id) return next(forbidden("A gym workspace is required"));
  return next();
}

// Blocks access unless the user's gym subscription is active. Platform admins
// (no gym scope) are never gated here. Used to gate paid features behind
// admin activation (the gym owner pays the platform over WhatsApp first).
export const requireActiveSubscription = asyncHandler(async (req, _res, next) => {
  const result = await query("SELECT subscription_status FROM gyms WHERE id = $1", [req.user.gym_id]);
  const status = result.rows[0]?.subscription_status;
  if (status !== "active") {
    throw forbidden(
      "This gym is not active yet. Please complete payment to activate your account.",
      "SUBSCRIPTION_INACTIVE"
    );
  }
  return next();
});
