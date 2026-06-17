import { Router } from "express";
import { roles } from "../config/roles.js";
import { checkIn, myAttendance } from "../controllers/attendanceController.js";
import { query } from "../db/pool.js";
import { authenticate, authorize, requireActiveSubscription, requireGymAccess } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const memberRoutes = Router();

memberRoutes.use(authenticate, authorize(roles.MEMBER, roles.GYM_OWNER), requireGymAccess, requireActiveSubscription);

memberRoutes.post("/attendance", checkIn);
memberRoutes.get("/attendance", myAttendance);

memberRoutes.get("/dashboard", asyncHandler(async (req, res) => {
  const memberResult = await query("SELECT * FROM members WHERE gym_id = $1 AND email = $2 LIMIT 1", [req.user.gym_id, req.user.email]);
  const member = memberResult.rows[0] || null;

  const [gym, payments, dietPlans, workoutPlans] = await Promise.all([
    query("SELECT name, slug, whatsapp, payment_qr_url FROM gyms WHERE id = $1", [req.user.gym_id]),
    member ? query("SELECT * FROM payments WHERE gym_id = $1 AND member_id = $2 ORDER BY created_at DESC", [req.user.gym_id, member.id]) : { rows: [] },
    member ? query("SELECT * FROM diet_plans WHERE gym_id = $1 AND member_id = $2 ORDER BY created_at DESC", [req.user.gym_id, member.id]) : { rows: [] },
    member ? query("SELECT * FROM workout_plans WHERE gym_id = $1 AND member_id = $2 ORDER BY created_at DESC", [req.user.gym_id, member.id]) : { rows: [] }
  ]);

  res.json({ success: true, data: { member, gym: gym.rows[0] || null, payments: payments.rows, dietPlans: dietPlans.rows, workoutPlans: workoutPlans.rows } });
}));

memberRoutes.get("/membership", asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT m.*, p.name AS plan_name, p.price, p.duration_days,
            g.name AS gym_name, g.whatsapp AS gym_whatsapp, g.payment_qr_url AS gym_payment_qr_url
     FROM members m
     LEFT JOIN membership_plans p ON p.id = m.membership_plan_id
     LEFT JOIN gyms g ON g.id = m.gym_id
     WHERE m.gym_id = $1 AND m.email = $2
     LIMIT 1`,
    [req.user.gym_id, req.user.email]
  );
  res.json({ success: true, data: result.rows[0] || null });
}));

memberRoutes.get("/payments", asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT pay.*
     FROM payments pay
     JOIN members m ON m.id = pay.member_id
     WHERE pay.gym_id = $1 AND m.email = $2
     ORDER BY pay.created_at DESC`,
    [req.user.gym_id, req.user.email]
  );
  res.json({ success: true, data: result.rows });
}));
