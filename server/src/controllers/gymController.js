import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/httpError.js";

export const listGyms = asyncHandler(async (_req, res) => {
  const result = await query("SELECT * FROM gyms ORDER BY created_at DESC");
  res.json({ success: true, data: result.rows });
});

export const getGymProfile = asyncHandler(async (req, res) => {
  const result = await query("SELECT * FROM gyms WHERE id = $1", [req.user.gym_id]);
  if (!result.rowCount) throw notFound("Gym profile not found");
  res.json({ success: true, data: result.rows[0] });
});

export const updateGymProfile = asyncHandler(async (req, res) => {
  const {
    name,
    logoUrl,
    address,
    phone,
    email,
    description,
    workingHours,
    whatsapp,
    paymentQrUrl
  } = req.body;

  // The public URL (slug) is fixed at registration and must NOT change when the
  // owner edits their profile — otherwise their gym website link would break.
  const result = await query(
    `UPDATE gyms
     SET name = COALESCE($2, name),
         logo_url = COALESCE($3, logo_url),
         address = COALESCE($4, address),
         phone = COALESCE($5, phone),
         email = COALESCE($6, email),
         description = COALESCE($7, description),
         working_hours = COALESCE($8, working_hours),
         whatsapp = COALESCE($9, whatsapp),
         payment_qr_url = COALESCE($10, payment_qr_url),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [req.user.gym_id, name, logoUrl, address, phone, email, description, workingHours, whatsapp, paymentQrUrl]
  );

  if (!result.rowCount) throw notFound("Gym profile not found");
  res.json({ success: true, data: result.rows[0] });
});

// Lightweight status endpoint the owner UI polls to decide whether to show the
// dashboard or the "pending activation" screen. Never gated by subscription.
export const getBillingStatus = asyncHandler(async (req, res) => {
  const result = await query(
    "SELECT subscription_plan, subscription_status, subscription_expires_at FROM gyms WHERE id = $1",
    [req.user.gym_id]
  );
  if (!result.rowCount) throw notFound("Gym profile not found");
  const gym = result.rows[0];
  res.json({
    success: true,
    data: {
      plan: gym.subscription_plan,
      status: gym.subscription_status,
      active: gym.subscription_status === "active",
      expiresAt: gym.subscription_expires_at
    }
  });
});

// Platform admin activates / suspends a gym after off-platform (WhatsApp) payment.
export const updateGymSubscription = asyncHandler(async (req, res) => {
  const { status, plan, expiresAt } = req.body;
  const result = await query(
    `UPDATE gyms
     SET subscription_status = COALESCE($2, subscription_status),
         subscription_plan = COALESCE($3, subscription_plan),
         subscription_expires_at = COALESCE($4, subscription_expires_at),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [req.params.id, status, plan, expiresAt]
  );
  if (!result.rowCount) throw notFound("Gym not found");
  res.json({ success: true, data: result.rows[0] });
});

export const getPublicGymBySlug = asyncHandler(async (req, res) => {
  const gymResult = await query(
    "SELECT id, name, slug, logo_url, address, phone, email, description, working_hours, whatsapp, payment_qr_url, subscription_status FROM gyms WHERE slug = $1",
    [req.params.slug]
  );
  if (!gymResult.rowCount) throw notFound("Gym website not found");

  const gym = gymResult.rows[0];
  const [plans, trainers] = await Promise.all([
    query("SELECT id, name, price, duration_days, description FROM membership_plans WHERE gym_id = $1 ORDER BY price ASC", [gym.id]),
    query("SELECT id, name, specialization, status FROM trainers WHERE gym_id = $1 AND status = 'active' ORDER BY name ASC", [gym.id])
  ]);

  res.json({
    success: true,
    data: {
      gym,
      plans: plans.rows,
      trainers: trainers.rows
    }
  });
});
