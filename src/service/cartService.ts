import { prisma } from "../db/prisma";

interface AddToCartInput {
  userId: string;
  productId: string;
  quantity?: number;
}

interface UpdateCartInput {
  userId: string;
  productId: string;
  quantity: number;
}

export class CartService {
  async addToCart(input: AddToCartInput) {
    const { userId, productId, quantity = 1 } = input;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const existingCart = await prisma.cart.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingCart) {
      return await prisma.cart.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existingCart.quantity + quantity },
        include: {
          product: true,
        },
      });
    }

    return await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async getCartItems(userId: string) {
    return await prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateCartQuantity(input: UpdateCartInput) {
    const { userId, productId, quantity } = input;

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    return await prisma.cart.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
      include: {
        product: true,
      },
    });
  }

  async removeFromCart(userId: string, productId: string) {
    return await prisma.cart.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  async clearCart(userId: string) {
    return await prisma.cart.deleteMany({
      where: { userId },
    });
  }

  async getCartCount(userId: string) {
    return await prisma.cart.count({
      where: { userId },
    });
  }

  async getCartTotal(userId: string) {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true },
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product.sellingPrice || 0) * item.quantity;
    }, 0);

    return {
      itemCount: cartItems.length,
      total,
      items: cartItems,
    };
  }
}
