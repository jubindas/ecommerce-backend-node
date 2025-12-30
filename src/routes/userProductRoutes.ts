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

const router = Router();

router.get("/", validate(getProductsQueryValidation), getAllProducts);

router.get("/special/featured", getFeaturedProducts);

router.get("/special/best-selling", getBestSellingProducts);

router.get("/special/new-collection", getNewCollectionProducts);

router.get("/search/query", searchProducts);

router.get(
  "/category/:categoryId",
  productIdParamValidation,
  validate(getProductsQueryValidation),
  getProductsByCategory
);

router.get(
  "/:productId",
  productIdParamValidation,
  validate(getProductsQueryValidation),
  getProductById
);

export default router;
