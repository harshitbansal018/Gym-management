import { query } from "../db/pool.js";

// Flip active members whose expiry date has passed to "expired". Runs on boot and
// then daily. Safe to run repeatedly (only touches rows that actually changed).
export async function expireMemberships() {
  try {
    const result = await query(
      "UPDATE members SET status = 'expired', updated_at = now() WHERE status = 'active' AND expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE"
    );
    if (result.rowCount) console.log(`Expired ${result.rowCount} membership(s)`);
  } catch (error) {
    console.error("expireMemberships job failed", error.message);
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function startMembershipExpiryJob() {
  expireMemberships();
  const timer = setInterval(expireMemberships, ONE_DAY_MS);
  timer.unref?.(); // don't keep the process alive just for this timer
  return timer;
}
