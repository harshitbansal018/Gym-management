// SaaS subscription tiers and their limits. Edit these numbers to match your
// pricing. `maxMembers: null` means unlimited.
export const planLimits = {
  Starter: { maxMembers: 100 },
  Professional: { maxMembers: 500 },
  Enterprise: { maxMembers: null }
};

export function memberLimitFor(plan) {
  const limit = planLimits[plan]?.maxMembers;
  return limit === undefined ? planLimits.Starter.maxMembers : limit;
}
