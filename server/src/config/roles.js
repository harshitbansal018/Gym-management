export const roles = Object.freeze({
  PLATFORM_ADMIN: "platform_admin",
  GYM_OWNER: "gym_owner",
  TRAINER: "trainer",
  MEMBER: "member"
});

export const publicUserFields = "id, name, email, role, gym_id, is_active, created_at";
