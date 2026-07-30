import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Squad from '../models/Squad';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary, upload } from '../services/cloudinary.service';

export const createSquad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (user?.squadId) {
      throw new AppError('Siz allaqachon bir skvaddasiz', 400);
    }

    const { name, description } = req.body;
    const existing = await Squad.findOne({ name });
    if (existing) {
      throw new AppError('Bu nom band', 409);
    }

    const userObjectId = new Types.ObjectId(userId);
    const squad = await Squad.create({
      name,
      description,
      leaderId: userObjectId,
      memberIds: [userObjectId],
      totalPoints: user?.points || 0,
    });

    await User.findByIdAndUpdate(userId, { squadId: squad._id });

    res.status(201).json({ success: true, squad });
  } catch (err) {
    next(err);
  }
};

export const getSquads = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const squads = await Squad.find()
      .sort({ totalPoints: -1 })
      .limit(50)
      .populate('leaderId', 'username avatarUrl')
      .select('-memberIds');

    res.json({ success: true, squads });
  } catch (err) {
    next(err);
  }
};

export const getSquadById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const squad = await Squad.findById(id)
      .populate('memberIds', 'username avatarUrl points')
      .populate('leaderId', 'username avatarUrl');

    if (!squad) {
      throw new AppError('Skvad topilmadi', 404);
    }

    res.json({ success: true, squad });
  } catch (err) {
    next(err);
  }
};

export const joinSquad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (user?.squadId) {
      throw new AppError('Avval joriy skvaddan chiqing', 400);
    }

    const squad = await Squad.findById(id);
    if (!squad) {
      throw new AppError('Skvad topilmadi', 404);
    }

    const userObjectId = new Types.ObjectId(userId);
    if (squad.memberIds.some((m) => m.toString() === userId)) {
      throw new AppError('Siz allaqachon bu skvaddasiz', 400);
    }

    squad.memberIds.push(userObjectId);
    squad.totalPoints += user?.points || 0;
    await squad.save();

    await User.findByIdAndUpdate(userId, { squadId: squad._id });

    res.json({ success: true, message: 'Skvadga qo\'shildingiz' });
  } catch (err) {
    next(err);
  }
};

export const leaveSquad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user?.squadId) {
      throw new AppError('Siz hech qanday skvadda emassiz', 400);
    }

    const squad = await Squad.findById(user.squadId);
    if (!squad) {
      throw new AppError('Skvad topilmadi', 404);
    }

    if (squad.leaderId.toString() === userId && squad.memberIds.length > 1) {
      throw new AppError('Skvadni tark etishdan oldin liderlikni boshqaga bering', 400);
    }

    squad.memberIds = squad.memberIds.filter((m) => m.toString() !== userId);
    squad.totalPoints = Math.max(0, squad.totalPoints - (user.points || 0));

    if (squad.memberIds.length === 0) {
      await squad.deleteOne();
    } else {
      await squad.save();
    }

    await User.findByIdAndUpdate(userId, { squadId: null });
    res.json({ success: true, message: 'Skvaddan chiqtingiz' });
  } catch (err) {
    next(err);
  }
};

export const uploadSquadAvatar = [
  upload.single('avatar'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const squad = await Squad.findById(id);
      if (!squad) {
        throw new AppError('Skvad topilmadi', 404);
      }

      if (squad.leaderId.toString() !== userId) {
        throw new AppError('Faqat lider avatar o\'zgartira oladi', 403);
      }

      if (!req.file) {
        throw new AppError('Rasm talab qilinadi', 400);
      }

      const { url } = await uploadToCloudinary(req.file.buffer, 'squads');
      squad.avatarUrl = url;
      await squad.save();

      res.json({ success: true, avatarUrl: url });
    } catch (err) {
      next(err);
    }
  },
];
