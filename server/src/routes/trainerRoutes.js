import { Router } from "express";
import { roles } from "../config/roles.js";
import { gymAttendance } from "../controllers/attendanceController.js";
import { listResource } from "../controllers/resourceController.js";
import { query } from "../db/pool.js";
import { authenticate, authorize, requireActiveSubscription, requireGymAccess } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const trainerRoutes = Router();

trainerRoutes.use(authenticate, authorize(roles.TRAINER, roles.GYM_OWNER), requireGymAccess, requireActiveSubscription);

trainerRoutes.get("/dashboard", asyncHandler(async (req, res) => {
  const [members, diets, workouts] = await Promise.all([
    query("SELECT COUNT(*)::int count FROM members WHERE gym_id = $1", [req.user.gym_id]),
    query("SELECT COUNT(*)::int count FROM diet_plans WHERE gym_id = $1", [req.user.gym_id]),
    query("SELECT COUNT(*)::int count FROM workout_plans WHERE gym_id = $1", [req.user.gym_id])
  ]);
  res.json({
    success: true,
    data: {
      assignedMembers: members.rows[0].count,
      dietPlans: diets.rows[0].count,
      workoutPlans: workouts.rows[0].count
    }
  });
}));

trainerRoutes.get("/members", listResource("members"));
trainerRoutes.get("/diet-plans", listResource("dietPlans"));
trainerRoutes.get("/workout-plans", listResource("workoutPlans"));
trainerRoutes.get("/attendance", gymAttendance);
