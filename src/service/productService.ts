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

interface UpdateProductInput extends Partial<CreateProductInput> { }

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
        isActive: true,
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
          quantity: input.product.quantity || 0,
          isActive: true,
          productImages: input.product.productImages
            ? JSON.stringify(input.product.productImages)
            : null,
        },
      });

      for (const variantInput of input.variants) {
        const sku =
          variantInput.sku ||
          (await productVariantService.generateSKU(
            product.id,
            variantInput.color,
            variantInput.size,
          ));

        const existingSKU = await tx.productVariant.findUnique({
          where: { sku },
        });

        if (existingSKU) {
          throw new Error(`SKU ${sku} already exists`);
        }

        await tx.productVariant.create({
          data: {
            productId: product.id,
            ...variantInput,
            sku,
            variantImages: variantInput.variantImages
              ? JSON.stringify(variantInput.variantImages)
              : null,
          },
        });
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
    page?: number,
    limit?: number,
    filters?: {
      categoryId?: string;
      isFeatured?: boolean;
      isBestSelling?: boolean;
      isNewCollection?: boolean;
      includeInactive?: boolean;
    },
  ) {
    const where: any = {};

    // Only filter by isActive if includeInactive is not true
    if (!filters?.includeInactive) {
      where.isActive = true;
    }

    if (filters?.categoryId) {
      where.OR = [
        { masterCategoryId: filters.categoryId },
        { lastCategoryId: filters.categoryId },
      ];
    }

    if (typeof filters?.isFeatured === "boolean") {
      where.isFeatured = filters.isFeatured;
    }

    if (typeof filters?.isBestSelling === "boolean") {
      where.isBestSelling = filters.isBestSelling;
    }

    if (typeof filters?.isNewCollection === "boolean") {
      where.isNewCollection = filters.isNewCollection;
    }

    const queryOptions: any = {
      where,
      orderBy: { createdAt: "desc" },
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
        variants: true,
      },
    };

    if (page && limit) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany(queryOptions),
      prisma.product.count({ where }),
    ]);

    // Add variant count to each product
    const productsWithCount = products.map((product: any) => ({
      ...product,
      variantCount: product.variants?.length || 0,
    }));

    return {
      products: productsWithCount,
      total,
      page: page || 1,
      limit: limit || total,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  },

  async getFeaturedProducts(limit = 10) {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
    });
  },

  async getBestSellingProducts(limit = 10) {
    return prisma.product.findMany({
      where: { isBestSelling: true, isActive: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
    });
  },

  async getNewCollectionProducts(limit = 10) {
    return prisma.product.findMany({
      where: { isNewCollection: true, isActive: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
      },
    });
  },

  async getProductById(productId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: { id: productId, isActive: true },
      include: {
        masterCategory: true,
        lastCategory: true,
        sizeChart: true,
        variants: true,
      },
    });
  },

  async getProductsByCategory(categoryId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      OR: [{ masterCategoryId: categoryId }, { lastCategoryId: categoryId }],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          masterCategory: true,
          lastCategory: true,
          sizeChart: true,
        },
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

  /* ========================= UPDATE ========================= */

  async updateProduct(
    productId: string,
    input: UpdateProductInput,
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

  async updateInventory(updates: InventoryUpdate[]) {
    return prisma.$transaction(
      updates.map(({ productId, variantId, quantity }) =>
        variantId
          ? prisma.productVariant.update({
            where: { id: variantId },
            data: { quantity },
          })
          : prisma.product.update({
            where: { id: productId },
            data: { quantity },
          }),
      ),
    );
  },

  async updateProductWithVariants(
    productId: string,
    input: {
      product?: UpdateProductInput;
      variants?: Array<{
        id?: string; // If provided, update existing variant; if not, create new
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
        quantity?: number;
        lowStockAlert?: number;
        expiryDate?: Date;
        hasCashOnDelivery?: boolean;
        sizeChartId?: string;
        isRelatedItem?: boolean;
        isDefault?: boolean;
        isActive?: boolean;
      }>;
      deleteVariantIds?: string[]; // IDs of variants to delete
    },
  ): Promise<Product> {
    const { productVariantService } = await import("./productVariantService");

    return prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Update product if product data is provided
      if (input.product) {
        const updateData: any = { ...input.product };

        if (input.product.productImages) {
          updateData.productImages = JSON.stringify(input.product.productImages);
        }

        await tx.product.update({
          where: { id: productId },
          data: updateData,
        });
      }

      // Delete variants if specified
      if (input.deleteVariantIds && input.deleteVariantIds.length > 0) {
        await tx.productVariant.updateMany({
          where: {
            id: { in: input.deleteVariantIds },
            productId,
          },
          data: { isActive: false },
        });
      }

      // Process variants (create or update)
      if (input.variants && input.variants.length > 0) {
        for (const variantInput of input.variants) {
          if (variantInput.id) {
            // Update existing variant
            const updateData: any = { ...variantInput };
            delete updateData.id; // Remove id from update data

            if (variantInput.variantImages) {
              updateData.variantImages = JSON.stringify(variantInput.variantImages);
            }

            // Check if variant belongs to this product
            const existingVariant = await tx.productVariant.findUnique({
              where: { id: variantInput.id },
            });

            if (!existingVariant || existingVariant.productId !== productId) {
              throw new Error(`Variant ${variantInput.id} does not belong to this product`);
            }

            await tx.productVariant.update({
              where: { id: variantInput.id },
              data: updateData,
            });
          } else {
            // Create new variant
            const sku =
              variantInput.sku ||
              (await productVariantService.generateSKU(
                productId,
                variantInput.color,
                variantInput.size,
              ));

            const existingSKU = await tx.productVariant.findUnique({
              where: { sku },
            });

            if (existingSKU) {
              throw new Error(`SKU ${sku} already exists`);
            }

            await tx.productVariant.create({
              data: {
                productId,
                ...variantInput,
                sku,
                quantity: variantInput.quantity || 0,
                variantImages: variantInput.variantImages
                  ? JSON.stringify(variantInput.variantImages)
                  : null,
              },
            });
          }
        }
      }

      // Return updated product with all variants
      return tx.product.findUnique({
        where: { id: productId },
        include: {
          variants: true,
          masterCategory: true,
          lastCategory: true,
          sizeChart: true,
        },
      }) as Promise<Product>;
    });
  },

  /* ========================= DELETE ========================= */

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

  /* ========================= SEARCH ========================= */

  async searchProducts(query: string, limit = 10) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { productName: { contains: query } },
          { shortDesc: { contains: query } },
          { longDesc: { contains: query } },
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
};
