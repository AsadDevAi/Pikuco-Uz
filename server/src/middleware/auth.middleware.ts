import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import User from '../models/User';
import { clerkClient, getAuth } from '@clerk/express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    clerkId: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      throw new AppError('Avtorizatsiya talab qilinadi', 401);
    }

    let user = await User.findOne({ clerkId: auth.userId });
    
    if (!user) {
      // Lazy sync: fetch from Clerk API and create in Mongo
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const username = clerkUser.username || clerkUser.firstName || `user_${auth.userId.substring(0, 6)}`;
      const avatarUrl = clerkUser.imageUrl || '';

      user = await User.create({
        clerkId: auth.userId,
        email: email.toLowerCase(),
        username,
        avatarUrl,
        isVerified: true,
      });
    }

    req.user = { 
      id: user._id.toString(), 
      username: user.username, 
      email: user.email,
      clerkId: user.clerkId 
    };
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Avtorizatsiya xatosi', 401));
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      next();
      return;
    }

    const user = await User.findOne({ clerkId: auth.userId });
    if (user) {
      req.user = { 
        id: user._id.toString(), 
        username: user.username, 
        email: user.email,
        clerkId: user.clerkId 
      };
    }
    next();
  } catch {
    next();
  }
};
