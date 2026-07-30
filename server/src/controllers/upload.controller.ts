import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { upload, uploadToCloudinary } from '../services/cloudinary.service';
import { AppError } from '../middleware/errorHandler';

export const uploadMedia = [
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Fayl talab qilinadi', 400);
      }

      const folder = (req.query.folder as string) || 'misc';
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const { url, publicId } = await uploadToCloudinary(req.file.buffer, folder, resourceType);

      res.json({ success: true, url, publicId });
    } catch (err) {
      next(err);
    }
  },
];
