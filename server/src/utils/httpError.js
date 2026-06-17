export class HttpError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    if (code) this.code = code;
  }
}

export const badRequest = (message, code) => new HttpError(400, message, code);
export const unauthorized = (message = "Unauthorized", code) => new HttpError(401, message, code);
export const forbidden = (message = "Forbidden", code) => new HttpError(403, message, code);
export const notFound = (message = "Resource not found", code) => new HttpError(404, message, code);
