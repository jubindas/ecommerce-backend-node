import { prisma } from "../db/prisma";

import { ProductVariant } from "../generated/prisma/client";

import { CustomError } from "../middleware/errorHandler";

interface CreateVariantInput {
  productId: string;
  sku?: string;
  variantName?: string;
  color?: string;
  size?: string;
  dimensions?: Record<string, any>;
  attributes?: Record<string, any>;
  variantImages?: string[];
  variantDescription?: string;
  buyingPrice?: number;
  maximumRetailPrice?: number;
  sellingPrice?: number;
  quantity: number;
  lowStockAlert?: number;
  expiryDate?: Date;
  hasCashOnDelivery?: boolean;
  sizeChartId?: string;
  isRelatedItem?: boolean;
  isDefault?: boolean;
}

interface UpdateVariantInput extends Partial<Omit<CreateVariantInput, 'productId'>> {}

export const productVariantService = {
 
  async generateSKU(productId: string, color?: string, size?: string): Promise<string> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { productName: true }
    });

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

     
    const productCode = product.productName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    
    const colorCode = color ? color.substring(0, 2).toUpperCase() : 'XX';
    const sizeCode = size ? size.toUpperCase().replace(/[^A-Z0-9]/g, '') : 'OS';
    const timestamp = Date.now().toString().slice(-6);

    return `${productCode}-${colorCode}-${sizeCode}-${timestamp}`;
  },

 
  async createVariant(input: CreateVariantInput): Promise<ProductVariant> {
  
    const product = await prisma.product.findUnique({
      where: { id: input.productId }
    });

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    if (!product.hasVariants) {
      throw new CustomError("Product does not support variants. Set hasVariants to true first.", 400);
    }

     
    const sku = input.sku || await this.generateSKU(input.productId, input.color, input.size);

 
    const existingSKU = await prisma.productVariant.findUnique({
      where: { sku }
    });

    if (existingSKU) {
      throw new CustomError(`SKU ${sku} already exists`, 400);
    }

   // Check Duplicate Color/Size
    if (input.color || input.size) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          productId: input.productId,
          color: input.color || null,
          size: input.size || null
        }
      });

      if (existingVariant) {
        throw new CustomError(
          `Variant with color "${input.color}" and size "${input.size}" already exists`,
          400
        );
      }
    }

 
    const variantData: any = {
      ...input,
      sku,
      variantImages: input.variantImages ? JSON.stringify(input.variantImages) : null,
    };

    return prisma.productVariant.create({
      data: variantData,
      include: {
        product: true,
        sizeChart: true
      }
    });
  },

 
  async createMultipleVariants(
    productId: string,
    variants: Omit<CreateVariantInput, 'productId'>[]
  ): Promise<ProductVariant[]> {
     
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    if (!product.hasVariants) {
      throw new CustomError("Product does not support variants. Set hasVariants to true first.", 400);
    }

    
    return prisma.$transaction(async (tx) => {
      const createdVariants: ProductVariant[] = [];

      for (const variantInput of variants) {
        
        const sku = variantInput.sku || await this.generateSKU(productId, variantInput.color, variantInput.size);

        
        const existingSKU = await tx.productVariant.findUnique({
          where: { sku }
        });

        if (existingSKU) {
          throw new CustomError(`SKU ${sku} already exists`, 400);
        }

        
        const variantData: any = {
          productId,
          ...variantInput,
          sku,
          variantImages: variantInput.variantImages ? JSON.stringify(variantInput.variantImages) : null,
        };

        const variant = await tx.productVariant.create({
          data: variantData,
          include: {
            product: true,
            sizeChart: true
          }
        });

        createdVariants.push(variant);
      }

      return createdVariants;
    });
  },

   
  async updateVariant(
    productId: string,
    variantId: string,
    input: UpdateVariantInput
  ): Promise<ProductVariant> {
 
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      throw new CustomError("Variant not found", 404);
    }

    if (existingVariant.productId !== productId) {
      throw new CustomError("Variant does not belong to this product", 400);
    }

 
    if (input.sku && input.sku !== existingVariant.sku) {
      const duplicateSKU = await prisma.productVariant.findUnique({
        where: { sku: input.sku }
      });

      if (duplicateSKU) {
        throw new CustomError(`SKU ${input.sku} already exists`, 400);
      }
    }
 
    if (input.color !== undefined || input.size !== undefined) {
      const color = input.color !== undefined ? input.color : existingVariant.color;
      const size = input.size !== undefined ? input.size : existingVariant.size;

      const duplicateVariant = await prisma.productVariant.findFirst({
        where: {
          productId,
          color: color || null,
          size: size || null,
          id: { not: variantId }
        }
      });

      if (duplicateVariant) {
        throw new CustomError(
          `Variant with color "${color}" and size "${size}" already exists`,
          400
        );
      }
    }

    
    const updateData: any = { ...input };
    
    if (input.variantImages) {
      updateData.variantImages = JSON.stringify(input.variantImages);
    }

    return prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
      include: {
        product: true,
        sizeChart: true
      }
    });
  },

 
  async deleteVariant(productId: string, variantId: string): Promise<ProductVariant> {
   
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      throw new CustomError("Variant not found", 404);
    }

    if (existingVariant.productId !== productId) {
      throw new CustomError("Variant does not belong to this product", 400);
    }

    return prisma.productVariant.update({
      where: { id: variantId },
      data: { isActive: false }
    });
  },

   
  async hardDeleteVariant(productId: string, variantId: string): Promise<ProductVariant> {
     
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      throw new CustomError("Variant not found", 404);
    }

    if (existingVariant.productId !== productId) {
      throw new CustomError("Variant does not belong to this product", 400);
    }

    return prisma.productVariant.delete({
      where: { id: variantId }
    });
  },

 
  async getVariantById(productId: string, variantId: string): Promise<ProductVariant | null> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            masterCategory: true,
            lastCategory: true
          }
        },
        sizeChart: true
      }
    });

    if (variant && variant.productId !== productId) {
      throw new CustomError("Variant does not belong to this product", 400);
    }

    return variant;
  },

   
  async getVariantsByProductId(
    productId: string,
    filters?: {
      color?: string;
      size?: string;
      isActive?: boolean;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<ProductVariant[]> {
    const where: any = { productId };

    if (filters?.color) {
      where.color = filters.color;
    }

    if (filters?.size) {
      where.size = filters.size;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.sellingPrice = {};
      if (filters.minPrice !== undefined) {
        where.sellingPrice.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.sellingPrice.lte = filters.maxPrice;
      }
    }

    return prisma.productVariant.findMany({
      where,
      include: {
        product: true,
        sizeChart: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  },

   
  async getAvailableColors(productId: string): Promise<string[]> {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true,
        color: { not: null }
      },
      select: { color: true },
      distinct: ['color']
    });

    return variants.map(v => v.color).filter(Boolean) as string[];
  },

 
  async getAvailableSizes(productId: string): Promise<string[]> {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true,
        size: { not: null }
      },
      select: { size: true },
      distinct: ['size']
    });

    return variants.map(v => v.size).filter(Boolean) as string[];
  }
};
