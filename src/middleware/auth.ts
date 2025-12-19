import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import { prisma } from "../db/prisma";

import { CustomError } from "./errorHandler";

import env from "../config/env";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("req path", req.path);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("No token provided", 401);
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new CustomError("No token provided", 401);
    }

    if (!env.JWT_SECRET) {
      throw new CustomError("JWT secret is not configured", 500);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET as string) as {
      id: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new CustomError("User no longer exists", 401);
    }

    if (!user.isActive) {
      throw new CustomError(
        "User account is deactivated. Please contact customer care for details.",
        401
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError("Invalid token", 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError("Token expired", 401));
    } else {
      next(error);
    }
  }
};
