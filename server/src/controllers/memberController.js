import { memberLimitFor } from "../config/plans.js";
import { roles } from "../config/roles.js";
import { withTransaction } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, forbidden } from "../utils/httpError.js";
import { hashPassword } from "../utils/password.js";

// Owner adds a member and, optionally, a login the member uses to sign in to
// their portal (pay via WhatsApp, self check-in, view plans). The owner shares
// the credentials with the member over WhatsApp — there is no email yet.
export const createMemberWithLogin = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone = null,
    membershipPlanId = null,
    trainerId = null,
    startDate = null,
    expiryDate = null,
    status = "pending",
    createLogin = false,
    password = null
  } = req.body;

  const normalizedEmail = email.toLowerCase();
  const gymId = req.user.gym_id;

  if (createLogin && !password) {
    throw badRequest("A password is required to create a member login");
  }

  const result = await withTransaction(async (client) => {
    // Enforce the gym's plan member cap.
    const gymRow = await client.query("SELECT subscription_plan FROM gyms WHERE id = $1", [gymId]);
    const limit = memberLimitFor(gymRow.rows[0]?.subscription_plan);
    if (limit !== null) {
      const countRow = await client.query("SELECT COUNT(*)::int count FROM members WHERE gym_id = $1", [gymId]);
      if (countRow.rows[0].count >= limit) {
        throw forbidden(
          `Your ${gymRow.rows[0].subscription_plan} plan allows up to ${limit} members. Upgrade to add more.`,
          "MEMBER_LIMIT_REACHED"
        );
      }
    }

    let userId = null;

    if (createLogin) {
      const exists = await client.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
      if (exists.rowCount) throw badRequest("A login with this email already exists");

      const passwordHash = await hashPassword(password);
      const userResult = await client.query(
        "INSERT INTO users (gym_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [gymId, name, normalizedEmail, passwordHash, roles.MEMBER]
      );
      userId = userResult.rows[0].id;
    }

    const memberResult = await client.query(
      `INSERT INTO members (gym_id, user_id, membership_plan_id, trainer_id, name, email, phone, start_date, expiry_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [gymId, userId, membershipPlanId, trainerId, name, normalizedEmail, phone, startDate, expiryDate, status]
    );

    return { member: memberResult.rows[0], loginCreated: Boolean(userId) };
  });

  res.status(201).json({
    success: true,
    data: result.member,
    // Surfaced once so the owner can copy and share over WhatsApp.
    login: result.loginCreated ? { email: normalizedEmail, password } : null
  });
});
