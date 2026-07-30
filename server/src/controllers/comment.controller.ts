import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

export const createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetType, targetId, content } = req.body;

    const comment = await Comment.create({
      targetType,
      targetId: new Types.ObjectId(targetId),
      userId: new Types.ObjectId(userId),
      content,
    });

    const populated = await comment.populate('userId', 'username avatarUrl');
    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetType, targetId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!targetType || !targetId) {
      throw new AppError('targetType va targetId talab qilinadi', 400);
    }

    const query = { targetType, targetId: new Types.ObjectId(targetId as string) };
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username avatarUrl'),
      Comment.countDocuments(query),
    ]);

    res.json({
      success: true,
      comments,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      throw new AppError('Izoh topilmadi', 404);
    }

    if (comment.userId.toString() !== userId) {
      throw new AppError('Ruxsat yo\'q', 403);
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Izoh o\'chirildi' });
  } catch (err) {
    next(err);
  }
};
