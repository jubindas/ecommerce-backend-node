import { Request, Response } from "express";

import { AuthRequest } from "../middleware/auth";

import * as reviewService from "../service/reviewService";

import { CustomError } from "../middleware/errorHandler";

import { ReviewStatus } from "../generated/prisma/enums";

export const createReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const { productId, rating, comment } = req.body;

  const image = req.file?.path;

  if (!productId || !rating || !userId) {
    throw new CustomError("Product ID and rating are required", 400);
  }

  const review = await reviewService.createReview({
    userId,
    productId,
    rating: parseInt(rating),
    comment,
    image,
  });

  res.status(201).json({
    success: true,
    message: "Review submitted successfully and is pending approval.",
    data: review,
  });
};

export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await reviewService.getProductReviews(productId, page, limit);

  res.status(200).json({
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
};

export const getAllReviewsForAdmin = async (
  req: AuthRequest,
  res: Response,
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await reviewService.getAllReviewsForAdmin(page, limit);

  res.status(200).json({
    success: true,
    message: "All reviews retrieved successfully",
    data: result,
  });
};

export const updateReviewStatus = async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;
  const { status } = req.body;

  if (!Object.values(ReviewStatus).includes(status)) {
    throw new CustomError("Invalid status", 400);
  }

  const review = await reviewService.updateReviewStatus(reviewId, status);

  res.status(200).json({
    success: true,
    message: `Review status updated to ${status}`,
    data: review,
  });
};

export const toggleReviewHighlight = async (
  req: AuthRequest,
  res: Response,
) => {
  const { reviewId } = req.params;

  const review = await reviewService.toggleReviewHighlight(reviewId);

  res.status(200).json({
    success: true,
    message: `Review highlighted status toggled to ${review.isHighlighted}`,
    data: review,
  });
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;

  const result = await reviewService.deleteReview(reviewId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};
