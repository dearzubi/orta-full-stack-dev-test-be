import { AppError } from "./app.error.js";

export class AuthorizationError extends AppError {
  constructor({ message = "Access denied", errorCode = "ACCESS_DENIED" }) {
    super({
      message,
      statusCode: 403,
      errorCode,
      isOperational: true,
    });
    this.name = "AuthorizationError";
  }
}
