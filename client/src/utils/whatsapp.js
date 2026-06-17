// Build a wa.me deep link. `number` must be in international format with country
// code and no '+', spaces, or dashes (e.g. 919876543210). Returns "" if missing.
export function waLink(number, message = "") {
  if (!number) return "";
  const digits = String(number).replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
