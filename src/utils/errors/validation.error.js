import { AppError } from "./app.error.js";
import { $ZodIssue } from "zod/v4/core";

export class ValidationError extends AppError {
  /** @type {Array<{path: string, error: string}> | undefined} */
  issues;

  /**
   * Custom validation error class
   *
   * @param {Object} params
   * @param {string} [params.message="Validation failed"] - Error message
   * @param {$ZodIssue[]} [params.issues] - Array of zod validation issues
   * @param {string} [params.errorCode="VALIDATION_ERROR"] - Application-specific error code
   * @param {Error} [params.cause] - The original error that caused this error, if any
   */
  constructor({
    message = "Validation failed",
    issues,
    errorCode = "VALIDATION_ERROR",
    cause,
  }) {
    super(message, 400, errorCode, true, cause);
    this.name = "ValidationError";
    this.issues = issues.map((issue) => {
      return {
        path: issue.path.join("."),
        error: issue.message,
      };
    });
  }

  /**
   * Serialize error for API responses
   * @param {Object} [options]
   * @param {boolean} [options.removeStack=false] - Whether to exclude the stack trace from the output
   * @returns {SerialisedError} Serialized error object
   * */
  toJSON(options) {
    return {
      ...super.toJSON(options),
      issues: this.issues,
    };
  }
}
