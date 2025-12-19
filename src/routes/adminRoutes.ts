import { Router } from "express";

import {
  registerAdmin,
  getAllUsers,
  getUserById,
  updateUserStatus,
  verifyUser,
  deleteUser,
  getUserBankDetails,
  getAllUserBankDetails,
} from "../controller/adminController";

import { authMiddleware } from "../middleware/auth";

import { asyncHandler } from "../middleware/errorHandler";

import { adminAuthMiddleware } from "../middleware/authorization";

const router = Router();

router.post("/register", asyncHandler(registerAdmin));

router.use(authMiddleware);

router.use(adminAuthMiddleware);

router.get("/users", asyncHandler(getAllUsers));

router.get("/users/:userId", asyncHandler(getUserById));

router.put("/users/:userId/status", asyncHandler(updateUserStatus));

router.put("/users/:userId/verify", asyncHandler(verifyUser));

router.delete("/users/:userId", asyncHandler(deleteUser));

router.get("/bank-details", asyncHandler(getAllUserBankDetails));

router.get("/bank-details/:userId", asyncHandler(getUserBankDetails));

export default router;
