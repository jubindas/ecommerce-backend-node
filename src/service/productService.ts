import { prisma } from "../db/prisma";

import { Product } from "../generated/prisma/client";

interface CreateProductInput {
  productName: string;
  shortDesc?: string;
  longDesc?: string;
  mainImage: string;
  productImages?: string[];
  youtubeLink?: string;
  size?: string;
  expiryDate?: Date;
  buyingPrice?: number;
  maximumRetailPrice?: number;
  sellingPrice?: number;
  quantity: number;
  paymentType: string;
  dimensions?: Record<string, any>;
  metaData?: Record<string, any>;
  masterCategoryId: string;
  lastCategoryId?: string;
  sizeChartId?: string;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  isNewCollection?: boolean;
  isRelatedItem?: boolean;
}

interface UpdateProductInput extends Partial<CreateProductInput> {}

interface InventoryUpdate {
  productId: string;
  variantId?: string;
  quantity: number;
}

export const productService = {
  async createProduct(input: CreateProductInput): Promise<Product> {
    return prisma.product.create({
      data: {
        ...input,
        productImages: input.productImages
          ? JSON.stringify(input.productImages)
          : null,
      },
    });
  },

  async createProductWithVariants(input: {
    product: CreateProductInput;
    variants: Array<{
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
    }>;
  }): Promise<Product> {
     
    const { productVariantService } = await import("./productVariantService");

    return prisma.$transaction(async (tx) => {
      
      const product = await tx.product.create({
        data: {
          ...input.product,
          hasVariants: true,
          quantity: 0,  
          productImages: input.product.productImages
            ? JSON.stringify(input.product.productImages)
            : null,
        },
      });

  
      const createdVariants = [];

      for (const variantInput of input.variants) {
        
        const sku = variantInput.sku || await productVariantService.generateSKU(
          product.id,
          variantInput.color,
          variantInput.size
        );

      
        const existingSKU = await tx.productVariant.findUnique({
          where: { sku }
        });

        if (existingSKU) {
          throw new Error(`SKU ${sku} already exists`);
        }

      
        const variantData: any = {
          productId: product.id,
          ...variantInput,
          sku,
          variantImages: variantInput.variantImages 
            ? JSON.stringify(variantInput.variantImages) 
            : null,
        };

        const variant = await tx.productVariant.create({
          data: variantData,
        });

        createdVariants.push(variant);
      }

    
      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          variants: true,
          masterCategory: true,
          lastCategory: true,
          sizeChart: true,
        },
      }) as Promise<Product>;
    });
  },

  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    filters?: {
      categoryId?: string;
      isFeatured?: boolean;
      isBestSelling?: boolean;
      isNewCollection?: boolean;
      isActive?: boolean;
    }
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.categoryId) {
      where.OR = [
        { masterCategoryId: filters.categoryId },
        { lastCategoryId: filters.categoryId },
      ];
    }
    if (filters?.isFeatured !== undefined)
      where.isFeatured = filters.isFeatured;

    if (filters?.isBestSelling !== undefined)
      where.isBestSelling = filters.isBestSelling;

    if (filters?.isNewCollection !== undefined)
      where.isNewCollection = filters.isNewCollection;

    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          masterCategory: true,
          lastCategory: true,
          sizeChart: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getFeaturedProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getBestSellingProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: { isBestSelling: true, isActive: true },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getNewCollectionProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: { isNewCollection: true, isActive: true },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductById(productId: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
    });
  },

  async getProductsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { masterCategoryId: categoryId },
            { lastCategoryId: categoryId },
          ],
          isActive: true,
        },
        skip,
        take: limit,
        include: {
          masterCategory: true,
          lastCategory: true,
          sizeChart: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: {
          OR: [
            { masterCategoryId: categoryId },
            { lastCategoryId: categoryId },
          ],
          isActive: true,
        },
      }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateProduct(
    productId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    const updateData: any = { ...input };

    if (input.productImages) {
      updateData.productImages = JSON.stringify(input.productImages);
    }

    return prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  },

  async deleteProduct(productId: string): Promise<Product> {
    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  },

  async hardDeleteProduct(productId: string): Promise<Product> {
    return prisma.product.delete({
      where: { id: productId },
    });
  },

  async searchProducts(query: string, limit: number = 10) {
    return prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { productName: { contains: query } },
              { shortDesc: { contains: query } },
              { longDesc: { contains: query } },
            ],
          },
        ],
      },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
    });
  },

  async updateInventory(updates: InventoryUpdate[]) {
    return prisma.$transaction(
      updates.map(({ productId, variantId, quantity }) => {
        if (variantId) {
          return prisma.productVariant.update({
            where: { id: variantId },
            data: { quantity },
          });
        } else {
          return prisma.product.update({
            where: { id: productId },
            data: { quantity },
          });
        }
      })
    );
  },
};
