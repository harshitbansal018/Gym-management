import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "schema.sql");

try {
  const schema = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schema);
  console.log("Database migration completed");
} catch (error) {
  console.error("Migration failed", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
