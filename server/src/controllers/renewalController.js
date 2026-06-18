import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/httpError.js";

// Members whose membership is already expired or expiring within `within` days
// (default 14). `days_left` is negative for already-expired members.
export const listRenewals = asyncHandler(async (req, res) => {
  const within = Math.min(Math.max(Number(req.query.within) || 14, 1), 365);
  const result = await query(
    `SELECT m.id, m.name, m.email, m.phone, m.start_date, m.expiry_date, m.status,
            p.id AS plan_id, p.name AS plan_name, p.price AS plan_price, p.duration_days AS plan_duration_days,
            (m.expiry_date - CURRENT_DATE) AS days_left
     FROM members m
     LEFT JOIN membership_plans p ON p.id = m.membership_plan_id
     WHERE m.gym_id = $1
       AND m.expiry_date IS NOT NULL
       AND m.expiry_date <= CURRENT_DATE + ($2::int * INTERVAL '1 day')
     ORDER BY m.expiry_date ASC`,
    [req.user.gym_id, within]
  );
  res.json({ success: true, data: result.rows });
});

// Extend a member's membership. New expiry = later of (today, current expiry)
// + duration, so renewing early never loses the remaining days. Optionally logs
// the renewal as a successful payment for the plan's price.
export const renewMembership = asyncHandler(async (req, res) => {
  const gymId = req.user.gym_id;
  const memberId = req.params.id;

  const found = await query(
    `SELECT m.id, m.membership_plan_id, p.duration_days, p.price
     FROM members m
     LEFT JOIN membership_plans p ON p.id = m.membership_plan_id
     WHERE m.id = $1 AND m.gym_id = $2`,
    [memberId, gymId]
  );
  const member = found.rows[0];
  if (!member) throw notFound("Member not found");

  const days = req.body.days ? Number(req.body.days) : member.duration_days;
  if (!days) throw badRequest("This member has no plan duration. Assign a plan or pass a number of days.");

  const updated = await query(
    `UPDATE members
     SET expiry_date = (GREATEST(CURRENT_DATE, COALESCE(expiry_date, CURRENT_DATE)) + ($3::int * INTERVAL '1 day'))::date,
         start_date = COALESCE(start_date, CURRENT_DATE),
         status = 'active',
         updated_at = now()
     WHERE id = $1 AND gym_id = $2
     RETURNING id, name, email, phone, start_date, expiry_date, status`,
    [memberId, gymId, days]
  );

  if (req.body.recordPayment && member.price != null) {
    await query(
      `INSERT INTO payments (gym_id, member_id, membership_plan_id, amount, status, paid_at)
       VALUES ($1, $2, $3, $4, 'success', now())`,
      [gymId, memberId, member.membership_plan_id, member.price]
    );
  }

  res.json({ success: true, data: updated.rows[0] });
});
