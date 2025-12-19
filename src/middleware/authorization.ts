import { Response, NextFunction } from "express";

import { AuthRequest } from "./auth";

import { CustomError } from "./errorHandler";

import { prisma } from "../db/prisma";

export const adminAuthMiddleware = async (
  req: AuthRequest,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      throw new CustomError(
        "You do not have permission to access this resource",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
