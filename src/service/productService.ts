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
  buyingPrice: number;
  maximumRetailPrice: number;
  sellingPrice: number;
  quantity: number;
  paymentType: string;
  dimensions?: Record<string, any>;
  metaData?: Record<string, any>;
  masterCategoryId: string;
  lastCategoryId?: string;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  isNewCollection?: boolean;
  isRelatedItem?: boolean;
}

interface UpdateProductInput extends Partial<CreateProductInput> {}

export const productService = {
  // Create a new product
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

  // Get all products with filters and pagination
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

  // Get featured products
  async getFeaturedProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Get best selling products
  async getBestSellingProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: { isBestSelling: true, isActive: true },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Get new collection products
  async getNewCollectionProducts(limit: number = 10) {
    return prisma.product.findMany({
      where: { isNewCollection: true, isActive: true },
      take: limit,
      include: {
        masterCategory: true,
        lastCategory: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Get single product by ID
  async getProductById(productId: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        masterCategory: true,
        lastCategory: true,
      },
    });
  },

  // Get products by category
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

  // Update product
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

  // Delete product (soft delete)
  async deleteProduct(productId: string): Promise<Product> {
    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  },

  // Hard delete product (admin only)
  async hardDeleteProduct(productId: string): Promise<Product> {
    return prisma.product.delete({
      where: { id: productId },
    });
  },

  // Search products
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
      },
    });
  },
};
