import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import { uploadToCloudinary, upload } from '../services/cloudinary.service';
import { AppError } from '../middleware/errorHandler';

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select('-passwordHash -refreshToken -verificationToken -resetPasswordToken -email')
      .populate('squadId', 'name avatarUrl');

    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', 404);
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bio, username } = req.body;
    const userId = req.user!.id;

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) {
        throw new AppError('Bu foydalanuvchi nomi band', 409);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(bio !== undefined && { bio }), ...(username && { username }) },
      { new: true, select: '-passwordHash -refreshToken -verificationToken -resetPasswordToken' },
    );

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = [
  upload.single('avatar'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Rasm talab qilinadi', 400);
      }

      const { url } = await uploadToCloudinary(req.file.buffer, 'avatars');
      const user = await User.findByIdAndUpdate(
        req.user!.id,
        { avatarUrl: url },
        { new: true, select: '-passwordHash -refreshToken' },
      );

      res.json({ success: true, avatarUrl: url, user });
    } catch (err) {
      next(err);
    }
  },
];
