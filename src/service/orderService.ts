
import { prisma } from "../db/prisma";
import { OrderStatus, PaymentStatus } from "../generated/prisma/enums";

import { CustomError } from "../middleware/errorHandler";

export interface CreateOrderItemData {
  productId: string;
  variantId?: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CreateOrderData {
  userId: string;
  addressId: string;
  items: CreateOrderItemData[];
  paymentMethod: string;
  paymentId?: string;
  couponId?: number;
}

export const createOrder = async (data: CreateOrderData) => {
  const { userId, addressId, items, paymentMethod, paymentId, couponId } = data;

  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new CustomError("Invalid address", 400);
  }

  let totalAmount = 0;

  const orderItemsData: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    size: string | undefined;
    color: string | undefined;
  }[] = [];

  // 1. Validation and Stock Check Phase
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new CustomError(`Product not found: ${item.productId}`, 404);
    }

    let price = 0;
    let availableQuantity = 0;

    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId }
      });
      if (!variant) throw new CustomError(`Variant not found: ${item.variantId}`, 404);
      if (variant.productId !== item.productId) throw new CustomError("Variant mismatch", 400);

      price = variant.sellingPrice || variant.maximumRetailPrice || 0;
      availableQuantity = variant.quantity;

      if (availableQuantity < item.quantity) {
        throw new CustomError(`Insufficient stock for variant: ${variant.sku}`, 400);
      }
    } else {


      price = product.sellingPrice || product.maximumRetailPrice || 0;
      availableQuantity = product.quantity;

      if (availableQuantity < item.quantity) {
        throw new CustomError(`Insufficient stock for product: ${product.productName}`, 400);
      }
    }

    totalAmount += price * item.quantity;

    orderItemsData.push({
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
      price: price,
      size: item.size,
      color: item.color,
    });
  }


  let discountAmount = 0;
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (coupon && coupon.isActive) {



      if (coupon.type === "FIXED") {
        discountAmount = coupon.value;
      } else if (coupon.type === "PERCENTAGE") {
        discountAmount = (totalAmount * coupon.value) / 100;
      }
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const order = await prisma.$transaction(async (tx) => {

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        totalAmount,
        discountAmount,
        finalAmount,
        paymentMethod,
        paymentId,
        paymentStatus: paymentId ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        couponId,
        status: OrderStatus.PENDING,
        orderItems: {
          create: orderItemsData,
        },
        history: {
          create: {
            status: OrderStatus.PENDING,
            comment: "Order created",
          },
        },
      },
      include: {
        orderItems: true,
        history: true,
      },
    });


    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { decrement: item.quantity } }
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }
    }

    return newOrder;
  });

  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  comment?: string,
  userId?: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
      },
    });

    await tx.orderHistory.create({
      data: {
        orderId,
        status,
        comment,
        createdBy: userId,
      },
    });

    return updated;
  });

  return updatedOrder;
};

export const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: true,
          variant: true // Include variant details
        }
      },
      history: {
        orderBy: { createdAt: 'desc' }
      },
      address: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  return order;
}

export const getUserOrders = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const orders = await prisma.order.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        take: 1,
        include: { product: true, variant: true }
      },
      _count: {
        select: { orderItems: true }
      }
    }
  });

  const total = await prisma.order.count({ where: { userId } });

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export const getAllOrders = async (page = 1, limit = 10, status?: OrderStatus) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          fullName: true,
          email: true
        }
      },
      _count: {
        select: { orderItems: true }
      }
    }
  });

  const total = await prisma.order.count({ where });

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
