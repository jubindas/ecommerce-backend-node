import { Router } from "express";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
} from "../controller/productController";

import { authMiddleware } from "../middleware/auth";

import { adminAuthMiddleware } from "../middleware/authorization";

import { productImageUpload } from "../config/multer";

import { validate } from "../middleware/validation";

import {
  createProductValidation,
  updateProductValidation,
  productIdParamValidation,
} from "../validators/productValidators";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.use(adminAuthMiddleware);

router.post(
  "/",
  productImageUpload,
  validate(createProductValidation),
  asyncHandler(createProduct)
);

router.put(
  "/:productId",
  productImageUpload,
  validate(updateProductValidation),
  asyncHandler(updateProduct)
);

router.delete(
  "/:productId",
  validate(productIdParamValidation),
  asyncHandler(deleteProduct)
);

router.delete(
  "/:productId/hard",
  validate(productIdParamValidation),
  asyncHandler(hardDeleteProduct)
);

export default router;
