import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/httpError.js";

// When a payment is marked SUCCESS and names both a member and a plan, put that
// member on the plan they paid for, so it shows on their side (member portal).
async function applyPlanToMember(payment, gymId) {
  if (payment.status === "success" && payment.member_id && payment.membership_plan_id) {
    await query(
      "UPDATE members SET membership_plan_id = $3, updated_at = now() WHERE id = $1 AND gym_id = $2",
      [payment.member_id, gymId, payment.membership_plan_id]
    );
  }
}

export const createPayment = asyncHandler(async (req, res) => {
  const gymId = req.user.gym_id;
  const { memberId = null, membershipPlanId = null, amount, status = "pending" } = req.body;
  const result = await query(
    "INSERT INTO payments (gym_id, member_id, membership_plan_id, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [gymId, memberId || null, membershipPlanId || null, amount, status]
  );
  await applyPlanToMember(result.rows[0], gymId);
  res.status(201).json({ success: true, data: result.rows[0] });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const gymId = req.user.gym_id;
  const { memberId = null, membershipPlanId = null, amount, status = "pending" } = req.body;
  const result = await query(
    "UPDATE payments SET member_id = $3, membership_plan_id = $4, amount = $5, status = $6 WHERE id = $1 AND gym_id = $2 RETURNING *",
    [req.params.id, gymId, memberId || null, membershipPlanId || null, amount, status]
  );
  if (!result.rowCount) throw notFound("Payment not found");
  await applyPlanToMember(result.rows[0], gymId);
  res.json({ success: true, data: result.rows[0] });
});
