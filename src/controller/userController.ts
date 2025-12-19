import { Response } from "express";

import { AuthRequest } from "../middleware/auth";

import * as userService from "../service/userService";

import { CustomError } from "../middleware/errorHandler";

export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      throw new CustomError("fullName, email, and password are required", 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      throw new CustomError("Passwords do not match", 400);
    }

    if (password.length < 6) {
      throw new CustomError("Password must be at least 6 characters long", 400);
    }

    const result = await userService.registerUser({
      fullName,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }

    const result = await userService.loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const user = await userService.getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { fullName, email } = req.body;

    if (!fullName && !email) {
      throw new CustomError(
        "At least one field (fullName or email) is required",
        400
      );
    }

    const user = await userService.updateUserProfile(req.user.id, {
      fullName,
      email,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new CustomError("All fields are required", 400);
    }

    if (newPassword.length < 6) {
      throw new CustomError(
        "New password must be at least 6 characters long",
        400
      );
    }

    await userService.changePassword(req.user.id, {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    throw error;
  }
};

export const addBankDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { bankName, accountHolderName, ifsc, branchName, accountNumber } =
      req.body;

    if (
      !bankName ||
      !accountHolderName ||
      !ifsc ||
      !branchName ||
      !accountNumber
    ) {
      throw new CustomError("All bank details fields are required", 400);
    }

    const bankDetails = await userService.addBankDetails(req.user.id, {
      bankName,
      accountHolderName,
      ifsc,
      branchName,
      accountNumber,
    });

    res.status(201).json({
      success: true,
      message: "Bank details added successfully",
      data: bankDetails,
    });
  } catch (error) {
    throw error;
  }
};

export const updateBankDetailsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const { bankName, accountHolderName, ifsc, branchName, accountNumber } =
      req.body;

    if (
      !bankName ||
      !accountHolderName ||
      !ifsc ||
      !branchName ||
      !accountNumber
    ) {
      throw new CustomError("All bank details fields are required", 400);
    }

    const bankDetails = await userService.updateBankDetails(req.user.id, {
      bankName,
      accountHolderName,
      ifsc,
      branchName,
      accountNumber,
    });

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      data: bankDetails,
    });
  } catch (error) {
    throw error;
  }
};

export const getBankDetailsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError("User not authenticated", 401);
    }

    const bankDetails = await userService.getBankDetails(req.user.id);

    res.status(200).json({
      success: true,
      message: "Bank details retrieved successfully",
      data: bankDetails,
    });
  } catch (error) {
    throw error;
  }
};
