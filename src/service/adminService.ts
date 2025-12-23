import { prisma } from "../db/prisma";

import { hashPassword, comparePassword, generateToken } from "../auth/jwt";

import { CustomError } from "../middleware/errorHandler";

export interface LoginData {
  email: string;
  password: string;
}

export const registerAdmin = async (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.trim().toLowerCase() },
  });

  if (existingUser) {
    throw new CustomError("Email already exists", 409);
  }

  try {
    const hashedPassword = await hashPassword(data.password);

    const admin = await prisma.user.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return admin;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new CustomError("Email already exists", 409);
    }
    throw new CustomError("Failed to register admin. Please try again.", 500);
  }
};

export const loginAdmin = async (data: LoginData) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new CustomError("Invalid email or password", 401);
  }

  if (!user.isAdmin) {
    throw new CustomError("Access denied. Admin privileges required.", 403);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new CustomError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new CustomError(
      "Admin account is deactivated. Please contact support.",
      401
    );
  }

  const token = generateToken(user.id, user.id, user.email);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      isUserVerified: user.isUserVerified,
    },
    token,
  };
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
        isUserVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.user.count();

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw new CustomError("Failed to retrieve users", 500);
  }
};

export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
        isUserVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        bankDetails: {
          select: {
            id: true,
            bankName: true,
            accountHolderName: true,
            ifsc: true,
            branchName: true,
            accountNumber: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return user;
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError("Failed to retrieve user", 500);
  }
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError("Failed to update user status", 500);
  }
};

export const verifyUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.isUserVerified) {
      throw new CustomError("User is already verified", 400);
    }

    const verifiedUser = await prisma.user.update({
      where: { id: userId },
      data: { isUserVerified: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        isUserVerified: true,
        updatedAt: true,
      },
    });

    return verifiedUser;
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError("Failed to verify user", 500);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Prevent deleting admin users (business logic)
    if (user.isAdmin) {
      throw new CustomError("Cannot delete admin user", 403);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully" };
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError("Failed to delete user", 500);
  }
};

export const getUserBankDetails = async (userId: string) => {
  try {
    // First verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const bankDetails = await prisma.bankDetails.findUnique({
      where: { userId },
      select: {
        id: true,
        bankName: true,
        accountHolderName: true,
        ifsc: true,
        branchName: true,
        accountNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!bankDetails) {
      throw new CustomError("Bank details not found for this user", 404);
    }

    return bankDetails;
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError("Failed to retrieve bank details", 500);
  }
};

export const getAllUserBankDetails = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  try {
    const bankDetails = await prisma.bankDetails.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        bankName: true,
        accountHolderName: true,
        ifsc: true,
        branchName: true,
        accountNumber: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.bankDetails.count();

    return {
      bankDetails,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw new CustomError("Failed to retrieve bank details", 500);
  }
};
