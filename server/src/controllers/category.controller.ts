import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import { AppError } from '../middleware/errorHandler';

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug } = req.body;
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      throw new AppError('Bu kategoriya mavjud', 409);
    }
    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};
