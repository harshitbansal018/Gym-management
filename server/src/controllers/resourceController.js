import { query } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notFound } from "../utils/httpError.js";

const tableConfig = {
  plans: {
    table: "membership_plans",
    select: "id, gym_id, name, price, duration_days, description, created_at, updated_at",
    createSql: "INSERT INTO membership_plans (gym_id, name, price, duration_days, description) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    createValues: (body, gymId) => [gymId, body.name, body.price, body.durationDays, body.description || null],
    updateSql: "UPDATE membership_plans SET name = $3, price = $4, duration_days = $5, description = $6, updated_at = now() WHERE id = $1 AND gym_id = $2 RETURNING *",
    updateValues: (body, id, gymId) => [id, gymId, body.name, body.price, body.durationDays, body.description || null]
  },
  trainers: {
    table: "trainers",
    select: "id, gym_id, name, email, phone, specialization, status, created_at, updated_at",
    createSql: "INSERT INTO trainers (gym_id, name, email, phone, specialization, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    createValues: (body, gymId) => [gymId, body.name, body.email, body.phone || null, body.specialization || null, body.status || "active"],
    updateSql: "UPDATE trainers SET name = $3, email = $4, phone = $5, specialization = $6, status = $7, updated_at = now() WHERE id = $1 AND gym_id = $2 RETURNING *",
    updateValues: (body, id, gymId) => [id, gymId, body.name, body.email, body.phone || null, body.specialization || null, body.status || "active"]
  },
  members: {
    table: "members",
    select: "id, gym_id, membership_plan_id, trainer_id, name, email, phone, start_date, expiry_date, status, created_at, updated_at",
    createSql: "INSERT INTO members (gym_id, membership_plan_id, trainer_id, name, email, phone, start_date, expiry_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    createValues: (body, gymId) => [gymId, body.membershipPlanId || null, body.trainerId || null, body.name, body.email, body.phone || null, body.startDate || null, body.expiryDate || null, body.status || "pending"],
    updateSql: "UPDATE members SET membership_plan_id = $3, trainer_id = $4, name = $5, email = $6, phone = $7, start_date = $8, expiry_date = $9, status = $10, updated_at = now() WHERE id = $1 AND gym_id = $2 RETURNING *",
    updateValues: (body, id, gymId) => [id, gymId, body.membershipPlanId || null, body.trainerId || null, body.name, body.email, body.phone || null, body.startDate || null, body.expiryDate || null, body.status || "pending"]
  },
  payments: {
    table: "payments",
    select: "id, gym_id, member_id, membership_plan_id, amount, status, paid_at, created_at",
    createSql: "INSERT INTO payments (gym_id, member_id, membership_plan_id, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    createValues: (body, gymId) => [gymId, body.memberId || null, body.membershipPlanId || null, body.amount, body.status || "pending"]
  },
  dietPlans: {
    table: "diet_plans",
    select: "id, gym_id, trainer_id, member_id, title, description, calories, meals, created_at, updated_at",
    createSql: "INSERT INTO diet_plans (gym_id, trainer_id, member_id, title, description, calories, meals) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    createValues: (body, gymId) => [gymId, body.trainerId || null, body.memberId || null, body.title, body.description || null, body.calories || null, body.meals || null],
    updateSql: "UPDATE diet_plans SET trainer_id = $3, member_id = $4, title = $5, description = $6, calories = $7, meals = $8, updated_at = now() WHERE id = $1 AND gym_id = $2 RETURNING *",
    updateValues: (body, id, gymId) => [id, gymId, body.trainerId || null, body.memberId || null, body.title, body.description || null, body.calories || null, body.meals || null]
  },
  workoutPlans: {
    table: "workout_plans",
    select: "id, gym_id, trainer_id, member_id, title, description, exercises, created_at, updated_at",
    createSql: "INSERT INTO workout_plans (gym_id, trainer_id, member_id, title, description, exercises) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    createValues: (body, gymId) => [gymId, body.trainerId || null, body.memberId || null, body.title, body.description || null, body.exercises || null],
    updateSql: "UPDATE workout_plans SET trainer_id = $3, member_id = $4, title = $5, description = $6, exercises = $7, updated_at = now() WHERE id = $1 AND gym_id = $2 RETURNING *",
    updateValues: (body, id, gymId) => [id, gymId, body.trainerId || null, body.memberId || null, body.title, body.description || null, body.exercises || null]
  }
};

export function listResource(type) {
  return asyncHandler(async (req, res) => {
    const config = tableConfig[type];
    const result = await query(`SELECT ${config.select} FROM ${config.table} WHERE gym_id = $1 ORDER BY created_at DESC`, [req.user.gym_id]);
    res.json({ success: true, data: result.rows });
  });
}

export function createResource(type) {
  return asyncHandler(async (req, res) => {
    const config = tableConfig[type];
    const result = await query(config.createSql, config.createValues(req.body, req.user.gym_id));
    res.status(201).json({ success: true, data: result.rows[0] });
  });
}

export function updateResource(type) {
  return asyncHandler(async (req, res) => {
    const config = tableConfig[type];
    if (!config.updateSql) throw notFound("Update is not available for this resource");
    const result = await query(config.updateSql, config.updateValues(req.body, req.params.id, req.user.gym_id));
    if (!result.rowCount) throw notFound("Resource not found");
    res.json({ success: true, data: result.rows[0] });
  });
}

export function deleteResource(type) {
  return asyncHandler(async (req, res) => {
    const config = tableConfig[type];
    const result = await query(`DELETE FROM ${config.table} WHERE id = $1 AND gym_id = $2 RETURNING id`, [req.params.id, req.user.gym_id]);
    if (!result.rowCount) throw notFound("Resource not found");
    res.json({ success: true, message: "Deleted successfully" });
  });
}
