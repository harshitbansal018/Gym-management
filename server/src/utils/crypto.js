import crypto from "crypto";

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
