import { Request, Response } from "express";

import { productVariantService } from "../service/productVariantService";

import { CustomError } from "../middleware/errorHandler";

 
export const createVariant = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const variantImagesPaths = files?.variantImages?.map(file => file.path) || [];

    const variantData: any = {
      productId,
      sku: req.body.sku,
      variantName: req.body.variantName,
      color: req.body.color,
      size: req.body.size,
      dimensions: req.body.dimensions ? JSON.parse(req.body.dimensions) : undefined,
      attributes: req.body.attributes ? JSON.parse(req.body.attributes) : undefined,
      variantImages: variantImagesPaths.length > 0 ? variantImagesPaths : 
                     (req.body.variantImages ? JSON.parse(req.body.variantImages) : []),
      variantDescription: req.body.variantDescription,
      buyingPrice: req.body.buyingPrice ? parseFloat(req.body.buyingPrice) : undefined,
      maximumRetailPrice: req.body.maximumRetailPrice ? parseFloat(req.body.maximumRetailPrice) : undefined,
      sellingPrice: req.body.sellingPrice ? parseFloat(req.body.sellingPrice) : undefined,
      quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
      lowStockAlert: req.body.lowStockAlert ? parseInt(req.body.lowStockAlert) : undefined,
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
      hasCashOnDelivery: req.body.hasCashOnDelivery === 'true',
      sizeChartId: req.body.sizeChartId,
      isRelatedItem: req.body.isRelatedItem === 'true',
      isDefault: req.body.isDefault === 'true',
    };

    const variant = await productVariantService.createVariant(variantData);
    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    throw error;
  }
};

 
export const createMultipleVariants = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const { variants } = req.body;

    if (!Array.isArray(variants)) {
      throw new CustomError("Variants must be an array", 400);
    }

    const createdVariants = await productVariantService.createMultipleVariants(
      productId,
      variants
    );

    res.status(201).json({
      success: true,
      data: createdVariants,
      count: createdVariants.length
    });
  } catch (error) {
    throw error;
  }
};

 
export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const variantImagesPaths = files?.variantImages?.map(file => file.path) || [];

    const updateData: any = {};

    if (req.body.sku) updateData.sku = req.body.sku;

    if (req.body.variantName) updateData.variantName = req.body.variantName;
    
    if (req.body.color !== undefined) updateData.color = req.body.color;
    
    if (req.body.size !== undefined) updateData.size = req.body.size;
    
    if (req.body.dimensions) updateData.dimensions = JSON.parse(req.body.dimensions);
    
    if (req.body.attributes) updateData.attributes = JSON.parse(req.body.attributes);
    
    if (variantImagesPaths.length > 0) {
      updateData.variantImages = variantImagesPaths;
    } else if (req.body.variantImages) {
      updateData.variantImages = JSON.parse(req.body.variantImages);
    }
    
    if (req.body.variantDescription) updateData.variantDescription = req.body.variantDescription;
    
    if (req.body.buyingPrice) updateData.buyingPrice = parseFloat(req.body.buyingPrice);
    
    if (req.body.maximumRetailPrice) updateData.maximumRetailPrice = parseFloat(req.body.maximumRetailPrice);
    
    if (req.body.sellingPrice) updateData.sellingPrice = parseFloat(req.body.sellingPrice);
    
    if (req.body.quantity !== undefined) updateData.quantity = parseInt(req.body.quantity);
    
    if (req.body.lowStockAlert) updateData.lowStockAlert = parseInt(req.body.lowStockAlert);
    
    if (req.body.expiryDate) updateData.expiryDate = new Date(req.body.expiryDate);
    
    if (req.body.hasCashOnDelivery !== undefined) updateData.hasCashOnDelivery = req.body.hasCashOnDelivery === 'true';
    
    if (req.body.sizeChartId) updateData.sizeChartId = req.body.sizeChartId;
    
    if (req.body.isRelatedItem !== undefined) updateData.isRelatedItem = req.body.isRelatedItem === 'true';
    
    if (req.body.isDefault !== undefined) updateData.isDefault = req.body.isDefault === 'true';
    
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';

    const variant = await productVariantService.updateVariant(
      productId,
      variantId,
      updateData
    );
    res.status(200).json({ success: true, data: variant });
  } catch (error) {
    throw error;
  }
};

 
export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;
    await productVariantService.deleteVariant(productId, variantId);
    res.status(200).json({
      success: true,
      message: "Variant deleted successfully"
    });
  } catch (error) {
    throw error;
  }
};

 
export const getVariantById = async (req: Request, res: Response) => {
  try {
    const { productId, variantId } = req.params;
    const variant = await productVariantService.getVariantById(productId, variantId);

    if (!variant) {
      throw new CustomError("Variant not found", 404);
    }

    res.status(200).json({ success: true, data: variant });
  } catch (error) {
    throw error;
  }
};

/**
 * Get all variants for a product
 */
export const getVariantsByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const filters = {
      color: req.query.color as string,
      size: req.query.size as string,
      isActive: req.query.isActive === 'true',
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    };

    const variants = await productVariantService.getVariantsByProductId(
      productId,
      filters
    );

    res.status(200).json({
      success: true,
      data: variants,
      count: variants.length
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get available colors for a product
 */
export const getAvailableColors = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const colors = await productVariantService.getAvailableColors(productId);

    res.status(200).json({
      success: true,
      data: colors
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get available sizes for a product
 */
export const getAvailableSizes = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const sizes = await productVariantService.getAvailableSizes(productId);

    res.status(200).json({
      success: true,
      data: sizes
    });
  } catch (error) {
    throw error;
  }
};
