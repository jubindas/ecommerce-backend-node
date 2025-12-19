import bcrypt from "bcrypt";

import jwt, { SignOptions } from "jsonwebtoken";

import env from "../config/env";

const SALT_ROUNDS = 10;

const JWT_SECRET = env.JWT_SECRET;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (
  id: string,
  userId: string,
  email: string
): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id, userId, email }, JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
};
