import express from "express";
import mongoose from "mongoose";
import Shift from "../models/shiftsModel.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Retrieve and manage user shifts
 */

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Retrieve all shifts for a given user
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ObjectId of the user whose shifts to fetch
 *     responses:
 *       200:
 *         description: A list of shifts, populated with user and location
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 60f7a3e5b4dcb826d8fe1234
 *                   title:
 *                     type: string
 *                     example: Short Day
 *                   role:
 *                     type: string
 *                     example: Support Worker
 *                   typeOfShift:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: [ "Weekdays" ]
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6876ecb642df0376491dd254
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: john@example.com
 *                   location:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6876ec09d260b087559e5fff
 *                       name:
 *                         type: string
 *                         example: Clippers House, Clippers Quay
 *                       postCode:
 *                         type: string
 *                         example: M50 3XP
 *                       distance:
 *                         type: number
 *                         example: 0
 *                       constituency:
 *                         type: string
 *                         example: Salford and Eccles
 *                       adminDistrict:
 *                         type: string
 *                         example: Salford
 *                       cordinates:
 *                         type: object
 *                         properties:
 *                           longitude:
 *                             type: number
 *                             example: -2.286226
 *                           latitude:
 *                             type: number
 *                             example: 53.466921
 *                           useRotaCloud:
 *                             type: boolean
 *                             example: true
 *                   startTime:
 *                     type: string
 *                     example: "13:00"
 *                   finishTime:
 *                     type: string
 *                     example: "18:00"
 *                   numOfShiftsPerDay:
 *                     type: number
 *                     example: 1
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2025-06-17"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Bad request – userId missing or invalid
 *       403:
 *         description: Forbidden – userId does not match authenticated user
 *       500:
 *         description: Internal server error
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.query;
    const tokenUserId = req.user.id || req.user._id;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "userId query parameter is required" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (userId !== tokenUserId) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot fetch other users' shifts" });
    }

    const shifts = await Shift.find({ user: userId })
      .populate("user", "name email")
      .populate("location")
      .sort({ date: 1 });

    res.json(shifts);
  } catch (err) {
    console.error("Error fetching shifts:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
