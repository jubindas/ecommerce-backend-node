import express from "express";

import {
  createVariant,
  createMultipleVariants,
  updateVariant,
  deleteVariant,
  getVariantById,
  getVariantsByProductId,
  getAvailableColors,
  getAvailableSizes
} from "../controller/productVariantController";

import { authMiddleware } from "../middleware/auth";

import { adminAuthMiddleware } from "../middleware/authorization";

import { asyncHandler } from "../middleware/errorHandler";

import { variantImageUpload } from "../config/multer";

const router = express.Router();

 
router.post(
  "/:productId/variants",
  authMiddleware as any,
  adminAuthMiddleware as any,
  variantImageUpload,
  asyncHandler(createVariant)
);

 
router.post(
  "/:productId/variants/bulk",
  authMiddleware as any,
  adminAuthMiddleware as any,
  asyncHandler(createMultipleVariants)
);

 
router.get(
  "/:productId/variants",
  authMiddleware as any,
  adminAuthMiddleware as any,
  asyncHandler(getVariantsByProductId)
);

 
router.get(
  "/:productId/variants/colors",
  authMiddleware as any,
  adminAuthMiddleware as any,
  asyncHandler(getAvailableColors)
);

 
router.get(
  "/:productId/variants/sizes",
  authMiddleware as any,
  adminAuthMiddleware as any,
  asyncHandler(getAvailableSizes)
)

 
router.get(
  "/:productId/variants/:variantId",
  authMiddleware as any,
  adminAuthMiddleware as any,
  asyncHandler(getVariantById)
);

 
router.put(
  "/:productId/variants/:variantId",
  authMiddleware as any,
  adminAuthMiddleware as any,
  variantImageUpload,
  asyncHandler(updateVariant)
);

 
router.delete(
  "/:productId/variants/:variantId",
  authMiddleware as any,
  adminAuthMiddleware as any,
  asyncHandler(deleteVariant)
);

export default router;
