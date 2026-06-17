import { roles } from "../config/roles.js";
import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const platformDashboard = asyncHandler(async (_req, res) => {
  const [gyms, members, revenue, payments] = await Promise.all([
    query("SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE subscription_status = 'active')::int active FROM gyms"),
    query("SELECT COUNT(*)::int total FROM members"),
    query("SELECT COALESCE(SUM(amount), 0)::float total FROM payments WHERE status = 'success' AND paid_at >= date_trunc('month', now())"),
    query("SELECT COUNT(*)::int total FROM payments")
  ]);

  res.json({
    success: true,
    data: {
      totalGyms: gyms.rows[0].total,
      activeGyms: gyms.rows[0].active,
      expiredGyms: gyms.rows[0].total - gyms.rows[0].active,
      totalMembers: members.rows[0].total,
      monthlyRevenue: revenue.rows[0].total,
      totalPayments: payments.rows[0].total
    }
  });
});

export const ownerDashboard = asyncHandler(async (req, res) => {
  const gymId = req.user.gym_id;
  const [members, revenueToday, revenueMonth, payments, expiring, attendanceToday] = await Promise.all([
    query("SELECT status, COUNT(*)::int count FROM members WHERE gym_id = $1 GROUP BY status", [gymId]),
    query("SELECT COALESCE(SUM(amount), 0)::float total FROM payments WHERE gym_id = $1 AND status = 'success' AND paid_at::date = CURRENT_DATE", [gymId]),
    query("SELECT COALESCE(SUM(amount), 0)::float total FROM payments WHERE gym_id = $1 AND status = 'success' AND paid_at >= date_trunc('month', now())", [gymId]),
    query("SELECT status, COUNT(*)::int count FROM payments WHERE gym_id = $1 GROUP BY status", [gymId]),
    query("SELECT COUNT(*)::int count FROM members WHERE gym_id = $1 AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'", [gymId]),
    query("SELECT COUNT(*)::int count FROM attendance WHERE gym_id = $1 AND checked_in_at::date = CURRENT_DATE", [gymId])
  ]);

  res.json({
    success: true,
    data: {
      members: members.rows,
      revenueToday: revenueToday.rows[0].total,
      revenueThisMonth: revenueMonth.rows[0].total,
      payments: payments.rows,
      membershipsExpiringSoon: expiring.rows[0].count,
      attendanceToday: attendanceToday.rows[0].count
    }
  });
});

export const roleDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === roles.PLATFORM_ADMIN) return platformDashboard(req, res);
  return ownerDashboard(req, res);
});
