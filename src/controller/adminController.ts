import { Request, Response } from "express";

import { AuthRequest } from "../middleware/auth";

import * as adminService from "../service/adminService";

import { CustomError } from "../middleware/errorHandler";

export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = await adminService.registerAdmin(req.body);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: admin,
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }

    const result = await adminService.loginAdmin({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      throw new CustomError("Page and limit must be positive numbers", 400);
    }

    const result = await adminService.getAllUsers(page, limit);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { userId } = req.params;

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }

    const user = await adminService.getUserById(userId);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    throw error;
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }

    if (isActive === undefined) {
      throw new CustomError("isActive field is required", 400);
    }

    if (typeof isActive !== "boolean") {
      throw new CustomError("isActive must be a boolean", 400);
    }

    const user = await adminService.updateUserStatus(userId, isActive);

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    throw error;
  }
};

export const verifyUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { userId } = req.params;

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }

    const user = await adminService.verifyUser(userId);

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      data: user,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { userId } = req.params;

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }

    const result = await adminService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
};

export const getUserBankDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { userId } = req.params;

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }

    const bankDetails = await adminService.getUserBankDetails(userId);

    res.status(200).json({
      success: true,
      message: "Bank details retrieved successfully",
      data: bankDetails,
    });
  } catch (error) {
    throw error;
  }
};

export const getAllUserBankDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      throw new CustomError("Page and limit must be positive numbers", 400);
    }

    const result = await adminService.getAllUserBankDetails(page, limit);

    res.status(200).json({
      success: true,
      message: "Bank details retrieved successfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};
