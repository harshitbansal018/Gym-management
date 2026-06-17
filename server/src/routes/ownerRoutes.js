import { Router } from "express";
import { roles } from "../config/roles.js";
import { ownerDashboard } from "../controllers/dashboardController.js";
import { gymAttendance } from "../controllers/attendanceController.js";
import { getBillingStatus, getGymProfile, updateGymProfile } from "../controllers/gymController.js";
import { createResource, deleteResource, listResource, updateResource } from "../controllers/resourceController.js";
import { createMemberWithLogin } from "../controllers/memberController.js";
import { createGymUser, listGymUsers, resetMemberPassword } from "../controllers/userController.js";
import { authenticate, authorize, requireActiveSubscription, requireGymAccess } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { resetPasswordValidator } from "../validators/authValidators.js";
import {
  dietPlanValidator,
  gymUserValidator,
  gymProfileValidator,
  memberValidator,
  memberWithLoginValidator,
  membershipPlanValidator,
  paymentValidator,
  trainerValidator,
  uuidParam,
  workoutPlanValidator
} from "../validators/gymValidators.js";

export const ownerRoutes = Router();

ownerRoutes.use(authenticate, authorize(roles.GYM_OWNER), requireGymAccess);

// Always reachable so the owner UI can render the "pending activation" screen.
ownerRoutes.get("/billing-status", getBillingStatus);
ownerRoutes.get("/dashboard", ownerDashboard);
ownerRoutes.get("/profile", getGymProfile);

// Everything below requires the gym to have been activated by a platform admin.
ownerRoutes.use(requireActiveSubscription);

ownerRoutes.patch("/profile", gymProfileValidator, validate, updateGymProfile);

ownerRoutes.get("/users", listGymUsers);
ownerRoutes.post("/users", gymUserValidator, validate, createGymUser);

ownerRoutes.get("/plans", listResource("plans"));
ownerRoutes.post("/plans", membershipPlanValidator, validate, createResource("plans"));
ownerRoutes.put("/plans/:id", uuidParam(), membershipPlanValidator, validate, updateResource("plans"));
ownerRoutes.delete("/plans/:id", uuidParam(), validate, deleteResource("plans"));

ownerRoutes.get("/trainers", listResource("trainers"));
ownerRoutes.post("/trainers", trainerValidator, validate, createResource("trainers"));
ownerRoutes.put("/trainers/:id", uuidParam(), trainerValidator, validate, updateResource("trainers"));
ownerRoutes.delete("/trainers/:id", uuidParam(), validate, deleteResource("trainers"));

ownerRoutes.get("/members", listResource("members"));
ownerRoutes.post("/members", memberWithLoginValidator, validate, createMemberWithLogin);
ownerRoutes.put("/members/:id", uuidParam(), memberValidator, validate, updateResource("members"));
ownerRoutes.delete("/members/:id", uuidParam(), validate, deleteResource("members"));
ownerRoutes.post("/members/:id/reset-password", uuidParam(), resetPasswordValidator, validate, resetMemberPassword);

ownerRoutes.get("/payments", listResource("payments"));
ownerRoutes.post("/payments", paymentValidator, validate, createResource("payments"));
ownerRoutes.delete("/payments/:id", uuidParam(), validate, deleteResource("payments"));

ownerRoutes.get("/diet-plans", listResource("dietPlans"));
ownerRoutes.post("/diet-plans", dietPlanValidator, validate, createResource("dietPlans"));
ownerRoutes.put("/diet-plans/:id", uuidParam(), dietPlanValidator, validate, updateResource("dietPlans"));
ownerRoutes.delete("/diet-plans/:id", uuidParam(), validate, deleteResource("dietPlans"));

ownerRoutes.get("/workout-plans", listResource("workoutPlans"));
ownerRoutes.post("/workout-plans", workoutPlanValidator, validate, createResource("workoutPlans"));
ownerRoutes.put("/workout-plans/:id", uuidParam(), workoutPlanValidator, validate, updateResource("workoutPlans"));
ownerRoutes.delete("/workout-plans/:id", uuidParam(), validate, deleteResource("workoutPlans"));

ownerRoutes.get("/attendance", gymAttendance);
