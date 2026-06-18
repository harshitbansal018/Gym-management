import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";

// Resolve the member record for the currently logged-in member user. `is_expired`
// is computed in SQL (vs CURRENT_DATE) so it's correct even before the daily
// expiry job has flipped the stored status.
async function findMemberForUser(user) {
  const result = await query(
    `SELECT id, name, status,
            (status = 'expired' OR (expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE)) AS is_expired
     FROM members WHERE gym_id = $1 AND email = $2 LIMIT 1`,
    [user.gym_id, user.email]
  );
  return result.rows[0] || null;
}

// Member self check-in (scans the gym door QR). One per calendar day, enforced
// by the unique index idx_attendance_member_day.
export const checkIn = asyncHandler(async (req, res) => {
  const member = await findMemberForUser(req.user);
  if (!member) throw notFound("No membership found for this account");

  // Block check-in unless the membership is active and unexpired.
  if (member.status !== "active" || member.is_expired) {
    const expired = member.is_expired || member.status === "expired";
    throw forbidden(
      expired
        ? "Your membership has expired. Please renew to check in."
        : "Your membership isn't active yet. Please contact your gym.",
      "MEMBERSHIP_INACTIVE"
    );
  }

  try {
    const result = await query(
      "INSERT INTO attendance (gym_id, member_id) VALUES ($1, $2) RETURNING id, checked_in_at",
      [req.user.gym_id, member.id]
    );
    res.status(201).json({
      success: true,
      message: `Checked in, ${member.name}!`,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      throw badRequest("You have already checked in today");
    }
    throw error;
  }
});

// Member's own recent check-in history.
export const myAttendance = asyncHandler(async (req, res) => {
  const member = await findMemberForUser(req.user);
  if (!member) return res.json({ success: true, data: [] });

  const result = await query(
    "SELECT id, checked_in_at FROM attendance WHERE member_id = $1 ORDER BY checked_in_at DESC LIMIT 60",
    [member.id]
  );
  res.json({ success: true, data: result.rows });
});

// Owner/trainer view: today's count + recent check-ins with member names.
export const gymAttendance = asyncHandler(async (req, res) => {
  const gymId = req.user.gym_id;
  const [today, recent] = await Promise.all([
    query(
      "SELECT COUNT(*)::int count FROM attendance WHERE gym_id = $1 AND checked_in_at::date = CURRENT_DATE",
      [gymId]
    ),
    query(
      `SELECT a.id, a.checked_in_at, m.name AS member_name, m.email AS member_email
       FROM attendance a
       JOIN members m ON m.id = a.member_id
       WHERE a.gym_id = $1
       ORDER BY a.checked_in_at DESC
       LIMIT 100`,
      [gymId]
    )
  ]);

  res.json({
    success: true,
    data: { todayCount: today.rows[0].count, recent: recent.rows }
  });
});
