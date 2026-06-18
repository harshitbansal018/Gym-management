import { body, param } from "express-validator";

export const uuidParam = (name = "id") => param(name).isUUID().withMessage(`${name} must be a valid UUID`);

export const gymProfileValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 120 }).withMessage("Gym name must be 2-120 characters"),
  body("logoUrl").optional({ nullable: true }).trim().isURL().withMessage("Logo URL must be valid"),
  body("address").optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage("Address is too long"),
  body("phone").optional({ nullable: true }).trim().isLength({ max: 30 }).withMessage("Phone is too long"),
  body("email").optional({ nullable: true }).trim().isEmail().normalizeEmail().withMessage("Email must be valid"),
  body("description").optional({ nullable: true }).trim().isLength({ max: 1000 }).withMessage("Description is too long"),
  body("workingHours").optional({ nullable: true }).trim().isLength({ max: 200 }).withMessage("Working hours is too long"),
  body("whatsapp").optional({ nullable: true }).trim().matches(/^[0-9]{8,15}$/).withMessage("WhatsApp number must be 8-15 digits, country code included, no '+'"),
  body("paymentQrUrl").optional({ nullable: true }).trim().isURL().withMessage("Payment QR URL must be valid")
];

export const gymSubscriptionValidator = [
  body("status").optional().isIn(["active", "pending", "suspended"]).withMessage("Invalid subscription status"),
  body("plan").optional().trim().isLength({ min: 2, max: 40 }).withMessage("Invalid plan"),
  body("expiresAt").optional({ nullable: true }).isISO8601().withMessage("expiresAt must be a date")
];

export const membershipPlanValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Plan name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("durationDays").isInt({ min: 1, max: 3650 }).withMessage("Duration must be 1-3650 days"),
  body("description").optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage("Description is too long")
];

export const trainerValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Trainer name is required"),
  body("email").trim().isEmail().normalizeEmail().withMessage("Trainer email is required"),
  body("phone").optional({ nullable: true }).trim().isLength({ max: 30 }).withMessage("Phone is too long"),
  body("specialization").optional({ nullable: true }).trim().isLength({ max: 120 }).withMessage("Specialization is too long"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid trainer status")
];

export const memberValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Member name is required"),
  body("email").trim().isEmail().normalizeEmail().withMessage("Member email is required"),
  body("phone").optional({ nullable: true }).trim().isLength({ max: 30 }).withMessage("Phone is too long"),
  body("membershipPlanId").optional({ nullable: true }).isUUID().withMessage("membershipPlanId must be UUID"),
  body("trainerId").optional({ nullable: true }).isUUID().withMessage("trainerId must be UUID"),
  body("startDate").optional({ nullable: true }).isISO8601().withMessage("startDate must be a date"),
  body("expiryDate").optional({ nullable: true }).isISO8601().withMessage("expiryDate must be a date"),
  body("status").optional().isIn(["active", "expired", "pending"]).withMessage("Invalid member status")
];

export const memberWithLoginValidator = [
  ...memberValidator,
  body("createLogin").optional().isBoolean().withMessage("createLogin must be a boolean"),
  body("password")
    .if((_value, { req }) => req.body.createLogin === true || req.body.createLogin === "true")
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must be strong (8+ chars, upper/lower/number/symbol)")
];

export const paymentValidator = [
  body("memberId").optional({ nullable: true }).isUUID().withMessage("memberId must be UUID"),
  body("membershipPlanId").optional({ nullable: true }).isUUID().withMessage("membershipPlanId must be UUID"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
  body("status").optional().isIn(["success", "pending", "failed"]).withMessage("Invalid payment status")
];

export const dietPlanValidator = [
  body("memberId").optional({ nullable: true }).isUUID().withMessage("memberId must be UUID"),
  body("trainerId").optional({ nullable: true }).isUUID().withMessage("trainerId must be UUID"),
  body("title").trim().isLength({ min: 2, max: 120 }).withMessage("Title is required"),
  body("description").optional({ nullable: true }).trim().isLength({ max: 1000 }).withMessage("Description is too long"),
  body("calories").optional({ nullable: true }).isInt({ min: 1, max: 20000 }).withMessage("Calories must be valid"),
  body("meals").optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage("Meals is too long")
];

export const workoutPlanValidator = [
  body("memberId").optional({ nullable: true }).isUUID().withMessage("memberId must be UUID"),
  body("trainerId").optional({ nullable: true }).isUUID().withMessage("trainerId must be UUID"),
  body("title").trim().isLength({ min: 2, max: 120 }).withMessage("Title is required"),
  body("description").optional({ nullable: true }).trim().isLength({ max: 1000 }).withMessage("Description is too long"),
  body("exercises").optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage("Exercises is too long")
];

export const renewValidator = [
  body("days").optional({ nullable: true }).isInt({ min: 1, max: 3650 }).withMessage("Days must be 1-3650"),
  body("recordPayment").optional().isBoolean().withMessage("recordPayment must be a boolean")
];

export const gymUserValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name is required"),
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }).withMessage("Password must be strong"),
  body("role").isIn(["trainer", "member"]).withMessage("Role must be trainer or member")
];
