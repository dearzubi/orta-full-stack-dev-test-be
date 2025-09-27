import express from "express";
import requireAuthMiddleware from "../middlewares/require-auth.middleware.js";
import requireAdminMiddleware from "../middlewares/require-admin.middleware.js";
import {
  createShiftController,
  updateShiftController,
  deleteShiftController,
  batchCreateUpdateShiftsController,
  cancelShiftController,
  clockInController,
  clockOutController,
  getAllShiftsController,
  getUserShiftsController,
} from "../controllers/shifts.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Retrieve and manage user shifts
 */

router.get(
  "/",
  requireAuthMiddleware,
  requireAdminMiddleware,
  getAllShiftsController,
);
router.get("/my-shifts", requireAuthMiddleware, getUserShiftsController);
router.post(
  "/",
  requireAuthMiddleware,
  requireAdminMiddleware,
  createShiftController,
);
router.post(
  "/batch",
  requireAuthMiddleware,
  requireAdminMiddleware,
  batchCreateUpdateShiftsController,
);
router.put(
  "/:id",
  requireAuthMiddleware,
  requireAdminMiddleware,
  updateShiftController,
);
router.delete(
  "/:id",
  requireAuthMiddleware,
  requireAdminMiddleware,
  deleteShiftController,
);
router.patch(
  "/:id/cancel",
  requireAuthMiddleware,
  requireAdminMiddleware,
  cancelShiftController,
);
router.patch("/:id/clock-in", requireAuthMiddleware, clockInController);
router.patch("/:id/clock-out", requireAuthMiddleware, clockOutController);

export default router;
