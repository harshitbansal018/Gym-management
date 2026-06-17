export function createSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "gym";
}

export async function createUniqueGymSlug(client, gymName) {
  const base = createSlug(gymName);
  let slug = base;
  let counter = 2;

  while (true) {
    const result = await client.query("SELECT id FROM gyms WHERE slug = $1", [slug]);
    if (!result.rowCount) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
