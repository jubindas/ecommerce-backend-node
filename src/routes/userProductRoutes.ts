import { Router } from "express";

import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getBestSellingProducts,
  getNewCollectionProducts,
  getProductsByCategory,
  searchProducts,
} from "../controller/productController";

import { validate } from "../middleware/validation";

import {
  productIdParamValidation,
  getProductsQueryValidation,
} from "../validators/productValidators";

import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.get(
  "/",
  validate(getProductsQueryValidation),
  asyncHandler(getAllProducts)
);

router.get("/special/featured", asyncHandler(getFeaturedProducts));

router.get("/special/best-selling", asyncHandler(getBestSellingProducts));

router.get("/special/new-collection", asyncHandler(getNewCollectionProducts));

router.get("/search/query", asyncHandler(searchProducts));

router.get(
  "/category/:categoryId",
  productIdParamValidation,
  validate(getProductsQueryValidation),
  asyncHandler(getProductsByCategory)
);

router.get(
  "/:productId",
  productIdParamValidation,
  validate(getProductsQueryValidation),
  asyncHandler(getProductById)
);

export default router;
