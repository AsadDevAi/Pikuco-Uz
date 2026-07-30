import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 12;

export const generateTokens = (userId: string, username: string, email: string) => {
  const accessToken = jwt.sign(
    { id: userId, username, email },
    process.env.JWT_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );
  return { accessToken, refreshToken };
};

export const registerUser = async (
  email: string,
  username: string,
  password: string,
  fullName: string,
): Promise<void> => {
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new AppError('Bu email allaqachon ro\'yxatdan o\'tgan', 409);
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new AppError('Bu foydalanuvchi nomi band', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    email: email.toLowerCase(),
    username,
    passwordHash,
    bio: fullName,
    verificationToken,
    verificationTokenExpiry,
  });

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  await sendVerificationEmail(email, fullName, verificationLink);
};

export const verifyEmail = async (token: string): Promise<void> => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Token yaroqsiz yoki muddati tugagan', 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Email yoki parol noto\'g\'ri', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Email yoki parol noto\'g\'ri', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Iltimos, avval emailingizni tasdiqlang', 403);
  }

  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.username,
    user.email,
  );

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      points: user.points,
      squadId: user.squadId,
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError('Refresh token talab qilinadi', 401);
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
  } catch {
    throw new AppError('Refresh token yaroqsiz', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Refresh token topilmadi', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id.toString(),
    user.username,
    user.email,
  );

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiry = resetTokenExpiry;
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(email, user.bio || user.username, resetLink);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Token yaroqsiz yoki muddati tugagan', 400);
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiry = null;
  user.refreshToken = null;
  await user.save();
};
