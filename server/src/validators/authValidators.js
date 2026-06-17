import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }).withMessage("Password must be strong"),
  body("gymName").trim().isLength({ min: 2, max: 120 }).withMessage("Gym name is required"),
  body("plan").optional().trim().isIn(["Starter", "Professional", "Enterprise"]).withMessage("Invalid subscription plan")
];

export const loginValidator = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 1 }).withMessage("Password is required")
];

export const refreshValidator = [
  body("refreshToken").isLength({ min: 20 }).withMessage("Refresh token is required")
];

const strongPassword = (field) =>
  body(field).isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must be 8+ chars with upper, lower, number, and symbol");

export const changePasswordValidator = [
  body("currentPassword").isLength({ min: 1 }).withMessage("Current password is required"),
  strongPassword("newPassword")
];

export const resetPasswordValidator = [strongPassword("newPassword")];
