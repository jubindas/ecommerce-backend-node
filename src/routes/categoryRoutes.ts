import { Router } from "express";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getRootCategories,
  getCategoryChildren,
  updateCategory,
  deleteCategory,
} from "../controller/categoryController";

import { authMiddleware } from "../middleware/auth";

import { asyncHandler } from "../middleware/errorHandler";

import { adminAuthMiddleware } from "../middleware/authorization";

const router = Router();

router.use(authMiddleware);

router.use(adminAuthMiddleware);

router.post("/", asyncHandler(createCategory));

router.get("/", asyncHandler(getAllCategories));

router.get("/roots", asyncHandler(getRootCategories));

router.get("/:categoryId", asyncHandler(getCategoryById));

router.get("/slug/:slug", asyncHandler(getCategoryBySlug));

router.get("/:categoryId/children", asyncHandler(getCategoryChildren));

router.put("/:categoryId", asyncHandler(updateCategory));

router.delete("/:categoryId", asyncHandler(deleteCategory));

export default router;
