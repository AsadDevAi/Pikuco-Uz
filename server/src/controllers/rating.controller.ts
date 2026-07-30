import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Rating from '../models/Rating';
import Test from '../models/Test';
import Post from '../models/Post';
import { AuthRequest } from '../middleware/auth.middleware';
import { awardPoints } from '../services/points.service';

export const upsertRating = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetType, targetId, stars } = req.body;

    const targetObjectId = new Types.ObjectId(targetId);

    const existing = await Rating.findOne({
      targetType,
      targetId: targetObjectId,
      userId: new Types.ObjectId(userId),
    });

    const oldStars = existing?.stars || 0;

    const rating = await Rating.findOneAndUpdate(
      { targetType, targetId: targetObjectId, userId: new Types.ObjectId(userId) },
      { stars },
      { upsert: true, new: true },
    );

    const Model = targetType === 'test' ? Test : Post;
    const target = await Model.findById(targetObjectId);

    if (target) {
      if (existing) {
        target.ratingSum = target.ratingSum - oldStars + stars;
      } else {
        target.ratingSum += stars;
        target.ratingCount += 1;
      }
      await target.save();

      if (stars === 5 && !existing) {
        const targetDoc = await Model.findById(targetObjectId).select('authorId');
        if (targetDoc && targetDoc.authorId.toString() !== userId) {
          await awardPoints(targetDoc.authorId.toString(), 'RECEIVE_5_STAR');
        }
      }
    }

    res.json({ success: true, rating });
  } catch (err) {
    next(err);
  }
};

export const getUserRating = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetType, targetId } = req.query;

    const rating = await Rating.findOne({
      targetType,
      targetId: new Types.ObjectId(targetId as string),
      userId: new Types.ObjectId(userId),
    });

    res.json({ success: true, rating });
  } catch (err) {
    next(err);
  }
};
