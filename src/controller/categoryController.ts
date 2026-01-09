import { Request, Response } from "express";

import { AuthRequest } from "../middleware/auth";

import * as categoryService from "../service/categoryService";

import { CustomError } from "../middleware/errorHandler";

// 7d86fb7e-f2b4-4a9b-8095-1f29c5165d49 -> Cat Id

export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { name, isActive, isFeatured, description, slug, parentId } =
      req.body;

    if (!name || name.trim() === "") {
      throw new CustomError("Category name is required", 400);
    }

    const category = await categoryService.createCategory({
      name: name.trim(),
      isActive,
      isFeatured,
      description,
      slug,
      parentId,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    throw error;
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const includeInactive = req.query.includeInactive === "true";

    if (page < 1 || limit < 1) {
      throw new CustomError("Page and limit must be positive numbers", 400);
    }

    const result = await categoryService.getAllCategories(
      page,
      limit,
      includeInactive
    );

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      throw new CustomError("Category ID is required", 400);
    }

    const category = await categoryService.getCategoryById(categoryId);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    throw error;
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw new CustomError("Category slug is required", 400);
    }

    const category = await categoryService.getCategoryBySlug(slug);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    throw error;
  }
};

export const getRootCategories = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await categoryService.getRootCategories();

    res.status(200).json({
      success: true,
      message: "Root categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    throw error;
  }
};

export const getCategoryChildren = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      throw new CustomError("Category ID is required", 400);
    }

    const children = await categoryService.getCategoryChildren(categoryId);

    res.status(200).json({
      success: true,
      message: "Category children retrieved successfully",
      data: children,
    });
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { categoryId } = req.params;
    const { name, isActive, isFeatured, description, slug, parentId } =
      req.body;

    if (!categoryId) {
      throw new CustomError("Category ID is required", 400);
    }

    if (name !== undefined && name.trim() === "") {
      throw new CustomError("Category name cannot be empty", 400);
    }

    const category = await categoryService.updateCategory(categoryId, {
      name: name?.trim(),
      isActive,
      isFeatured,
      description,
      slug,
      parentId,
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { categoryId } = req.params;

    if (!categoryId) {
      throw new CustomError("Category ID is required", 400);
    }

    const result = await categoryService.deleteCategory(categoryId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
};
