import { prisma } from "../db/prisma";

import { hashPassword, comparePassword, generateToken } from "../auth/jwt";

import { CustomError } from "../middleware/errorHandler";

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface BankDetailsData {
  bankName: string;
  accountHolderName: string;
  ifsc: string;
  branchName: string;
  accountNumber: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const registerUser = async (data: RegisterData) => {
  const { fullName, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new CustomError("Email already exists", 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id, user.id, user.email);

  return {
    user,
    token,
  };
};

export const loginUser = async (data: LoginData) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new CustomError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new CustomError("Invalid email or password", 401);
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

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      isAdmin: true,
      isUserVerified: true,
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
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: ProfileUpdateData
) => {
  const { fullName, email } = data;

  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new CustomError("Email already in use", 400);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(email && { email }),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      isAdmin: true,
      isUserVerified: true,
      updatedAt: true,
    },
  });

  return user;
};

export const changePassword = async (
  userId: string,
  data: PasswordChangeData
) => {
  const { currentPassword, newPassword, confirmPassword } = data;

  if (newPassword !== confirmPassword) {
    throw new CustomError("New passwords do not match", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new CustomError("Current password is incorrect", 401);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};

export const addBankDetails = async (userId: string, data: BankDetailsData) => {
  const existingBankDetails = await prisma.bankDetails.findUnique({
    where: { userId },
  });

  if (existingBankDetails) {
    throw new CustomError("Bank details already exist for this user", 400);
  }

  const bankDetails = await prisma.bankDetails.create({
    data: {
      ...data,
      userId,
    },
    select: {
      id: true,
      bankName: true,
      accountHolderName: true,
      ifsc: true,
      branchName: true,
      accountNumber: true,
      createdAt: true,
    },
  });

  return bankDetails;
};

export const updateBankDetails = async (
  userId: string,
  data: BankDetailsData
) => {
  const bankDetails = await prisma.bankDetails.findUnique({
    where: { userId },
  });

  if (!bankDetails) {
    throw new CustomError("Bank details not found for this user", 404);
  }

  const updatedBankDetails = await prisma.bankDetails.update({
    where: { userId },
    data,
    select: {
      id: true,
      bankName: true,
      accountHolderName: true,
      ifsc: true,
      branchName: true,
      accountNumber: true,
      updatedAt: true,
    },
  });

  return updatedBankDetails;
};

export const getBankDetails = async (userId: string) => {
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
    throw new CustomError("Bank details not found", 404);
  }

  return bankDetails;
};
