import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { productService } from "../service/productService";

// Admin Controllers

export const createProduct = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
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

  // Get uploaded images (mainImage + additional product images)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.mainImage || files.mainImage.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Main image is required",
    });
  }

  const mainImage = `/uploads/products/${files.mainImage[0].filename}`;
  const productImages = (files.productImages || []).map(
    (file) => `/uploads/products/${file.filename}`
  );

  try {
    const product = await productService.createProduct({
      productName,
      shortDesc,
      longDesc,
      mainImage,
      productImages,
      youtubeLink,
      size,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      buyingPrice: parseFloat(buyingPrice),
      maximumRetailPrice: parseFloat(maximumRetailPrice),
      sellingPrice: parseFloat(sellingPrice),
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

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId } = req.params;
  const updateData = req.body;

  // Add new images if uploaded
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
        updateData.productImages = [...updateData.productImages, ...newImages];
      } else {
        updateData.productImages = newImages;
      }
    }
  }

  // Parse JSON fields if they're strings
  if (typeof updateData.dimensions === "string") {
    updateData.dimensions = JSON.parse(updateData.dimensions);
  }
  if (typeof updateData.metaData === "string") {
    updateData.metaData = JSON.parse(updateData.metaData);
  }

  try {
    const product = await productService.updateProduct(productId, updateData);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId } = req.params;

  try {
    const product = await productService.deleteProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

export const hardDeleteProduct = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId } = req.params;

  try {
    const product = await productService.hardDeleteProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Product permanently deleted",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

// User/Public Controllers

export const getAllProducts = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    categoryId,
    isFeatured,
    isBestSelling,
    isNewCollection,
  } = req.query;

  try {
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

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve products",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { productId } = req.params;

  try {
    const product = await productService.getProductById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve product",
    });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  try {
    const products = await productService.getFeaturedProducts(
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      message: "Featured products retrieved successfully",
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve featured products",
    });
  }
};

export const getBestSellingProducts = async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  try {
    const products = await productService.getBestSellingProducts(
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      message: "Best selling products retrieved successfully",
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve best selling products",
    });
  }
};

export const getNewCollectionProducts = async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  try {
    const products = await productService.getNewCollectionProducts(
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      message: "New collection products retrieved successfully",
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve new collection products",
    });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const result = await productService.getProductsByCategory(
      categoryId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      message: "Category products retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve category products",
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  const { query, limit = 10 } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  try {
    const products = await productService.searchProducts(
      query as string,
      parseInt(limit as string)
    );

    return res.status(200).json({
      success: true,
      message: "Products found",
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to search products",
    });
  }
};
