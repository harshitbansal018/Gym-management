import { validationResult } from "express-validator";
import { badRequest } from "../utils/httpError.js";

export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return next(badRequest(result.array().map((item) => item.msg).join(", ")));
}
