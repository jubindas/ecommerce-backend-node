import { Request, Response } from "express";

import { validationResult } from "express-validator";

import { productService } from "../service/productService";

import { asyncHandler } from "../lib/asyncHandler";

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const {
      productName,
      shortDesc,
      longDesc,
      youtubeLink,
      size,
      expiryDate,
      buyingPrice,
      maximumRetailPrice,
      sellingPrice,
      quantity,
      paymentType,
      dimensions,
      metaData,
      masterCategoryId,
      lastCategoryId,
      isFeatured,
      isBestSelling,
      isNewCollection,
      isRelatedItem,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.mainImage || files.mainImage.length === 0) {
      res.status(400).json({
        success: false,
        message: "Main image is required",
      });
      return;
    }

    const mainImage = `/uploads/products/${files.mainImage[0].filename}`;
    const productImages = (files.productImages || []).map(
      (file) => `/uploads/products/${file.filename}`
    );

    const product = await productService.createProduct({
      productName,
      shortDesc,
      longDesc,
      mainImage,
      productImages,
      youtubeLink,
      size,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      buyingPrice: buyingPrice ? parseFloat(buyingPrice) : undefined,
      maximumRetailPrice: maximumRetailPrice
        ? parseFloat(maximumRetailPrice)
        : undefined,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
      quantity: parseInt(quantity),
      paymentType,
      dimensions: dimensions
        ? typeof dimensions === "string"
          ? JSON.parse(dimensions)
          : dimensions
        : undefined,
      metaData: metaData
        ? typeof metaData === "string"
          ? JSON.parse(metaData)
          : metaData
        : undefined,
      masterCategoryId,
      lastCategoryId,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isBestSelling: isBestSelling === "true" || isBestSelling === true,
      isNewCollection: isNewCollection === "true" || isNewCollection === true,
      isRelatedItem: isRelatedItem === "true" || isRelatedItem === true,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { productId } = req.params;

    const updateData = req.body;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.mainImage && files.mainImage.length > 0) {
        updateData.mainImage = `/uploads/products/${files.mainImage[0].filename}`;
      }

      if (files.productImages && files.productImages.length > 0) {
        const newImages = files.productImages.map(
          (file) => `/uploads/products/${file.filename}`
        );
        if (Array.isArray(updateData.productImages)) {
          updateData.productImages = [
            ...updateData.productImages,
            ...newImages,
          ];
        } else {
          updateData.productImages = newImages;
        }
      }
    }

    if (typeof updateData.dimensions === "string") {
      updateData.dimensions = JSON.parse(updateData.dimensions);
    }
    if (typeof updateData.metaData === "string") {
      updateData.metaData = JSON.parse(updateData.metaData);
    }

    if (updateData.buyingPrice) {
      updateData.buyingPrice = parseFloat(updateData.buyingPrice);
    }
    if (updateData.maximumRetailPrice) {
      updateData.maximumRetailPrice = parseFloat(updateData.maximumRetailPrice);
    }
    if (updateData.sellingPrice) {
      updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    }

    const product = await productService.updateProduct(productId, updateData);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { productId } = req.params;

    const product = await productService.deleteProduct(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  }
);

export const hardDeleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { productId } = req.params;

    const product = await productService.hardDeleteProduct(productId);

    res.status(200).json({
      success: true,
      message: "Product permanently deleted",
      data: product,
    });
  }
);

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      categoryId,
      isFeatured,
      isBestSelling,
      isNewCollection,
    } = req.query;

    const filters: any = { isActive: true };
    if (categoryId) filters.categoryId = categoryId as string;
    if (isFeatured === "true") filters.isFeatured = true;
    if (isBestSelling === "true") filters.isBestSelling = true;
    if (isNewCollection === "true") filters.isNewCollection = true;

    const result = await productService.getAllProducts(
      parseInt(page as string),
      parseInt(limit as string),
      filters
    );

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  }
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { productId } = req.params;

    const product = await productService.getProductById(productId);

    if (!product || !product.isActive) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  }
);

export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const products = await productService.getFeaturedProducts(
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: "Featured products retrieved successfully",
      data: products,
    });
  }
);

export const getBestSellingProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const products = await productService.getBestSellingProducts(
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: "Best selling products retrieved successfully",
      data: products,
    });
  }
);

export const getNewCollectionProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const products = await productService.getNewCollectionProducts(
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: "New collection products retrieved successfully",
      data: products,
    });
  }
);

export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await productService.getProductsByCategory(
      categoryId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: "Category products retrieved successfully",
      data: result,
    });
  }
);

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { query, limit = 10 } = req.query;

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const products = await productService.searchProducts(
      query as string,
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: "Products found",
      data: products,
    });
  }
);
