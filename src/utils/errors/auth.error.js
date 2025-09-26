import { AppError } from "./app.error.js";

export class AuthorizationError extends AppError {
  constructor({ message = "Access denied", errorCode = "ACCESS_DENIED" }) {
    super(message, 403, errorCode, true);
    this.name = "AuthorizationError";
  }
}
