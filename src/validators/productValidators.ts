import { body, param, query } from "express-validator";

export const createProductValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Product name must be between 3 and 255 characters"),

  body("shortDesc")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Short description must not exceed 500 characters"),

  body("longDesc")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Long description must not exceed 5000 characters"),

  // mainImage is handled as file upload - no body validation needed

  body("youtubeLink")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid YouTube URL"),

  body("size")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Size must not exceed 100 characters"),

  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid expiry date format"),

  body("buyingPrice")
    .notEmpty()
    .withMessage("Buying price is required")
    .isFloat({ min: 0 })
    .withMessage("Buying price must be a positive number"),

  body("maximumRetailPrice")
    .notEmpty()
    .withMessage("Maximum retail price is required")
    .isFloat({ min: 0 })
    .withMessage("Maximum retail price must be a positive number"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),

  body("paymentType")
    .trim()
    .notEmpty()
    .withMessage("Payment type is required")
    .isIn(["cash", "credit", "debit", "upi", "all"])
    .withMessage("Invalid payment type"),

  body("masterCategoryId")
    .trim()
    .notEmpty()
    .withMessage("Master category is required")
    .isUUID()
    .withMessage("Master category must be a valid UUID"),

  body("lastCategoryId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Last category must be a valid UUID"),

  body("dimensions")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("Dimensions must be valid JSON");
        }
      }
      return true;
    }),

  body("metaData")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (parsed.title && typeof parsed.title !== "string") {
            throw new Error("metaData.title must be a string");
          }
          if (parsed.description && typeof parsed.description !== "string") {
            throw new Error("metaData.description must be a string");
          }
          if (parsed.keywords && !Array.isArray(parsed.keywords)) {
            throw new Error("metaData.keywords must be an array");
          }
          return true;
        } catch {
          throw new Error("MetaData must be valid JSON");
        }
      }
      return true;
    }),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("isBestSelling")
    .optional()
    .isBoolean()
    .withMessage("isBestSelling must be a boolean"),

  body("isNewCollection")
    .optional()
    .isBoolean()
    .withMessage("isNewCollection must be a boolean"),

  body("isRelatedItem")
    .optional()
    .isBoolean()
    .withMessage("isRelatedItem must be a boolean"),
];

export const updateProductValidation = [
  param("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),

  body("productName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Product name must be between 3 and 255 characters"),

  body("shortDesc")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Short description must not exceed 500 characters"),

  body("longDesc")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Long description must not exceed 5000 characters"),

  body("buyingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Buying price must be a positive number"),

  body("maximumRetailPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum retail price must be a positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),

  body("paymentType")
    .optional()
    .trim()
    .isIn(["cash", "credit", "debit", "upi", "all"])
    .withMessage("Invalid payment type"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("isBestSelling")
    .optional()
    .isBoolean()
    .withMessage("isBestSelling must be a boolean"),

  body("isNewCollection")
    .optional()
    .isBoolean()
    .withMessage("isNewCollection must be a boolean"),

  body("isRelatedItem")
    .optional()
    .isBoolean()
    .withMessage("isRelatedItem must be a boolean"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const productIdParamValidation = [
  param("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isUUID()
    .withMessage("Product ID must be a valid UUID"),
];

export const getProductsQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("categoryId")
    .optional()
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),

  query("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  query("isBestSelling")
    .optional()
    .isBoolean()
    .withMessage("isBestSelling must be a boolean"),

  query("isNewCollection")
    .optional()
    .isBoolean()
    .withMessage("isNewCollection must be a boolean"),
];
