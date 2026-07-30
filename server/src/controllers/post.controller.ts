import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { awardPoints } from '../services/points.service';

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, content, coverImage, categoryId } = req.body;

    const post = await Post.create({
      authorId: new Types.ObjectId(userId),
      title,
      content,
      coverImage: coverImage || '',
      categoryId: categoryId ? new Types.ObjectId(categoryId) : null,
    });

    await awardPoints(userId, 'CREATE_POST');

    res.status(201).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      categoryId,
      sort = 'newest',
      page = '1',
      limit = '12',
      authorId,
      search,
    } = req.query;

    const query: Record<string, unknown> = {};

    if (categoryId) query.categoryId = new Types.ObjectId(categoryId as string);
    if (authorId) query.authorId = new Types.ObjectId(authorId as string);
    if (search) query.title = { $regex: search, $options: 'i' };

    const sortMap: Record<string, Record<string, number>> = {
      newest: { createdAt: -1 },
      popular: { viewsCount: -1 },
      top: { ratingSum: -1 },
    };

    const sortObj = sortMap[sort as string] || sortMap.newest;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate('authorId', 'username avatarUrl')
        .populate('categoryId', 'name slug')
        .select('-content'),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate('authorId', 'username avatarUrl bio points')
      .populate('categoryId', 'name slug');

    if (!post) {
      throw new AppError('Post topilmadi', 404);
    }

    await Post.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError('Post topilmadi', 404);
    }

    if (post.authorId.toString() !== userId) {
      throw new AppError('Ruxsat yo\'q', 403);
    }

    const updated = await Post.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, post: updated });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError('Post topilmadi', 404);
    }

    if (post.authorId.toString() !== userId) {
      throw new AppError('Ruxsat yo\'q', 403);
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post o\'chirildi' });
  } catch (err) {
    next(err);
  }
};
