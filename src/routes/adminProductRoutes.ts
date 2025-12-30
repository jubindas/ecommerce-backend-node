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

const router = Router();

router.use(authMiddleware as any);

router.use(adminAuthMiddleware as any);

router.post(
  "/",
  productImageUpload,
  validate(createProductValidation),
  createProduct
);

router.put(
  "/:productId",
  productImageUpload,
  validate(updateProductValidation),
  updateProduct
);

router.delete("/:productId", validate(productIdParamValidation), deleteProduct);

router.delete(
  "/:productId/hard",
  validate(productIdParamValidation),
  hardDeleteProduct
);

export default router;
