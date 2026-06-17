import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { app } from "./app.js";
import { startMembershipExpiryJob } from "./jobs/expireMemberships.js";

const server = app.listen(env.PORT, () => {
  console.log(`FitManager API running on port ${env.PORT}`);
  startMembershipExpiryJob();
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
