import { Router } from "express";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  addBankDetails,
  updateBankDetailsController,
  getBankDetailsController,
} from "../controller/userController";

import { authMiddleware } from "../middleware/auth";

import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/register", asyncHandler(register));

router.post("/login", asyncHandler(login));

router.get("/profile", authMiddleware, asyncHandler(getProfile));

router.put("/profile", authMiddleware, asyncHandler(updateProfile));

router.put("/change-password", authMiddleware, asyncHandler(changePassword));

router.post("/bank-details", authMiddleware, asyncHandler(addBankDetails));

router.put(
  "/bank-details",
  authMiddleware,
  asyncHandler(updateBankDetailsController)
);
router.get(
  "/bank-details",
  authMiddleware,
  asyncHandler(getBankDetailsController)
);

export default router;
