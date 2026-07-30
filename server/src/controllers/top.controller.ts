import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Test from '../models/Test';
import Post from '../models/Post';
import Squad from '../models/Squad';

export const getTopUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = 'allTime', limit = '20' } = req.query;
    const sortField = period === 'monthly' ? 'monthlyPoints' : 'points';

    const users = await User.find({ isVerified: true })
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit as string))
      .select('username avatarUrl points monthlyPoints squadId')
      .populate('squadId', 'name');

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const getTopTests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = '20' } = req.query;

    const tests = await Test.find({ status: 'published' })
      .sort({ ratingSum: -1, ratingCount: -1 })
      .limit(parseInt(limit as string))
      .populate('authorId', 'username avatarUrl')
      .populate('categoryId', 'name slug')
      .select('-content');

    res.json({ success: true, tests });
  } catch (err) {
    next(err);
  }
};

export const getTopPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = '20' } = req.query;

    const posts = await Post.find()
      .sort({ ratingSum: -1, ratingCount: -1 })
      .limit(parseInt(limit as string))
      .populate('authorId', 'username avatarUrl')
      .populate('categoryId', 'name slug')
      .select('-content');

    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

export const getTopSquads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = '20' } = req.query;

    const squads = await Squad.find()
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit as string))
      .populate('leaderId', 'username avatarUrl')
      .select('-memberIds');

    res.json({ success: true, squads });
  } catch (err) {
    next(err);
  }
};
