import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthorizationError } from "../utils/errors/auth.error.js";
import * as process from "node:process";

/**
 * Middleware to require authentication using JWT
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const requireAuthMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new AuthorizationError({
        message: "Authorization header missing",
        errorCode: "AUTH_HEADER_MISSING",
      });
    }
    const token = authorization.split(" ");

    if (token.length !== 2) {
      throw new AuthorizationError(
        "Invalid authorization header",
        "AUTH_HEADER_INVALID",
      );
    }

    if (token[0] !== "Bearer") {
      throw new AuthorizationError(
        `Invalid authorization header scheme. Expected 'Bearer' but got: ${token[0]}`,
        "AUTH_HEADER_INVALID_SCHEME",
      );
    }

    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
export default requireAuthMiddleware;
