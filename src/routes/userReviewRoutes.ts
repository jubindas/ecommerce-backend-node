import { Router } from "express";
import {
  createReview,
  getProductReviews,
} from "../controller/reviewController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/reviews/");
  },
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Public: Get reviews for a product
router.get("/product/:productId", asyncHandler(getProductReviews));

// Protected: Submit a review
router.post(
  "/",
  authMiddleware as any,
  upload.single("image"),
  asyncHandler(createReview),
);

export default router;
