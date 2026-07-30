import { Response, NextFunction } from 'express';
import { Types, SortOrder } from 'mongoose';
import Test from '../models/Test';
import TestPass from '../models/TestPass';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { awardPoints } from '../services/points.service';
import {
  QuizContent,
  IdentificationContent,
  TournamentContent,
  TreeContent,
} from '../models/Test';

export const createTest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, title, description, coverImage, categoryId, status, content } = req.body;

    const test = await Test.create({
      authorId: new Types.ObjectId(userId),
      type,
      title,
      description,
      coverImage,
      categoryId: categoryId ? new Types.ObjectId(categoryId) : null,
      status,
      content,
    });

    if (status === 'published') {
      await awardPoints(userId, 'CREATE_TEST');
    }

    res.status(201).json({ success: true, test });
  } catch (err) {
    next(err);
  }
};

export const getTests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      type,
      categoryId,
      status = 'published',
      sort = 'newest',
      page = '1',
      limit = '12',
      authorId,
      search,
    } = req.query;

    const query: Record<string, unknown> = { status };

    if (type) query.type = type;
    if (categoryId) query.categoryId = new Types.ObjectId(categoryId as string);
    if (authorId) query.authorId = new Types.ObjectId(authorId as string);
    if (search) query.title = { $regex: search, $options: 'i' };

    const sortMap: Record<string, Record<string, SortOrder>> = {
      newest: { createdAt: -1 },
      popular: { viewsCount: -1 },
      top: { ratingSum: -1 },
    };

    const sortObj = sortMap[sort as string] || sortMap.newest;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tests, total] = await Promise.all([
      Test.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate('authorId', 'username avatarUrl')
        .populate('categoryId', 'name slug')
        .select('-content'),
      Test.countDocuments(query),
    ]);

    res.json({
      success: true,
      tests,
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

export const getTestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const test = await Test.findById(id)
      .populate('authorId', 'username avatarUrl bio points')
      .populate('categoryId', 'name slug');

    if (!test) {
      throw new AppError('Test topilmadi', 404);
    }

    if (test.status === 'draft') {
      if (!req.user || req.user.id !== test.authorId.toString()) {
        throw new AppError('Test topilmadi', 404);
      }
    }

    await Test.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

    res.json({ success: true, test });
  } catch (err) {
    next(err);
  }
};

export const updateTest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const test = await Test.findById(id);
    if (!test) {
      throw new AppError('Test topilmadi', 404);
    }

    if (test.authorId.toString() !== userId) {
      throw new AppError('Ruxsat yo\'q', 403);
    }

    const wasPublished = test.status === 'published';

    const updated = await Test.findByIdAndUpdate(id, req.body, { new: true });

    if (!wasPublished && req.body.status === 'published') {
      await awardPoints(userId, 'CREATE_TEST');
    }

    res.json({ success: true, test: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteTest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const test = await Test.findById(id);
    if (!test) {
      throw new AppError('Test topilmadi', 404);
    }

    if (test.authorId.toString() !== userId) {
      throw new AppError('Ruxsat yo\'q', 403);
    }

    await test.deleteOne();
    res.json({ success: true, message: 'Test o\'chirildi' });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id;

    const test = await Test.findById(id);
    if (!test || test.type !== 'quiz') {
      throw new AppError('Test topilmadi', 404);
    }

    const content = test.content as QuizContent;
    let correctCount = 0;

    content.questions.forEach((question, idx) => {
      const userAnswer = answers[idx];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && question.options[userAnswer]?.isCorrect) {
        correctCount++;
      }
    });

    const totalQuestions = content.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const resultData = { score: correctCount, total: totalQuestions, percentage };

    const testPass = await TestPass.create({
      testId: new Types.ObjectId(id),
      userId: userId ? new Types.ObjectId(userId) : null,
      resultData,
    });

    await Test.findByIdAndUpdate(id, { $inc: { passCount: 1 } });

    if (userId) {
      const existingPass = await TestPass.countDocuments({
        testId: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });
      if (existingPass === 1) {
        await awardPoints(userId, 'COMPLETE_TEST');
      }
    }

    const totalPasses = await TestPass.countDocuments({ testId: new Types.ObjectId(id) });

    res.json({
      success: true,
      result: resultData,
      testPassId: testPass._id,
      totalPasses,
    });
  } catch (err) {
    next(err);
  }
};

export const submitIdentification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id;

    const test = await Test.findById(id);
    if (!test || test.type !== 'identification') {
      throw new AppError('Test topilmadi', 404);
    }

    const content = test.content as IdentificationContent;
    const scores: Record<string, number> = {};

    content.results.forEach((r) => {
      scores[r.id] = 0;
    });

    content.questions.forEach((question, idx) => {
      const optionIndex = answers[idx];
      if (optionIndex !== undefined && question.options[optionIndex]) {
        const weights = question.options[optionIndex].weights;
        Object.entries(weights).forEach(([resultId, weight]) => {
          if (scores[resultId] !== undefined) {
            scores[resultId] += weight;
          }
        });
      }
    });

    const topResultId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topResult = content.results.find((r) => r.id === topResultId);

    const resultData = { resultId: topResultId, result: topResult, scores };

    const testPass = await TestPass.create({
      testId: new Types.ObjectId(id),
      userId: userId ? new Types.ObjectId(userId) : null,
      resultData,
    });

    await Test.findByIdAndUpdate(id, { $inc: { passCount: 1 } });

    if (userId) {
      const existingPass = await TestPass.countDocuments({
        testId: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });
      if (existingPass === 1) {
        await awardPoints(userId, 'COMPLETE_TEST');
      }
    }

    const sameResultPasses = await TestPass.countDocuments({
      testId: new Types.ObjectId(id),
      'resultData.resultId': topResultId,
    });
    const totalPasses = await TestPass.countDocuments({ testId: new Types.ObjectId(id) });
    const sameResultPercentage = totalPasses > 0 ? Math.round((sameResultPasses / totalPasses) * 100) : 0;

    res.json({
      success: true,
      result: resultData,
      testPassId: testPass._id,
      totalPasses,
      sameResultPercentage,
    });
  } catch (err) {
    next(err);
  }
};

export const submitTournament = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { winnerId } = req.body;
    const userId = req.user?.id;

    const test = await Test.findById(id);
    if (!test || test.type !== 'tournament') {
      throw new AppError('Test topilmadi', 404);
    }

    const content = test.content as TournamentContent;
    const winner = content.items.find((item) => item.id === winnerId);
    if (!winner) {
      throw new AppError('G\'olib topilmadi', 400);
    }

    const resultData = { winnerId, winner };

    const testPass = await TestPass.create({
      testId: new Types.ObjectId(id),
      userId: userId ? new Types.ObjectId(userId) : null,
      resultData,
    });

    await Test.findByIdAndUpdate(id, { $inc: { passCount: 1 } });

    if (userId) {
      const existingPass = await TestPass.countDocuments({
        testId: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });
      if (existingPass === 1) {
        await awardPoints(userId, 'COMPLETE_TEST');
      }
    }

    const winnerPasses = await TestPass.countDocuments({
      testId: new Types.ObjectId(id),
      'resultData.winnerId': winnerId,
    });
    const totalPasses = await TestPass.countDocuments({ testId: new Types.ObjectId(id) });

    res.json({
      success: true,
      result: resultData,
      testPassId: testPass._id,
      totalPasses,
      winnerPopularity: totalPasses > 0 ? Math.round((winnerPasses / totalPasses) * 100) : 0,
    });
  } catch (err) {
    next(err);
  }
};

export const submitTree = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { endingNodeId, path } = req.body;
    const userId = req.user?.id;

    const test = await Test.findById(id);
    if (!test || test.type !== 'tree') {
      throw new AppError('Test topilmadi', 404);
    }

    const content = test.content as TreeContent;
    const endingNode = content.nodes.find((n) => n.id === endingNodeId && n.isEnding);
    if (!endingNode) {
      throw new AppError('Yakunlovchi tugun topilmadi', 400);
    }

    const resultData = { endingNodeId, endingNode, path };

    const testPass = await TestPass.create({
      testId: new Types.ObjectId(id),
      userId: userId ? new Types.ObjectId(userId) : null,
      resultData,
    });

    await Test.findByIdAndUpdate(id, { $inc: { passCount: 1 } });

    if (userId) {
      const existingPass = await TestPass.countDocuments({
        testId: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });
      if (existingPass === 1) {
        await awardPoints(userId, 'COMPLETE_TEST');
      }
    }

    const totalPasses = await TestPass.countDocuments({ testId: new Types.ObjectId(id) });

    res.json({
      success: true,
      result: resultData,
      testPassId: testPass._id,
      totalPasses,
    });
  } catch (err) {
    next(err);
  }
};

export const getTestStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const test = await Test.findById(id);
    if (!test) {
      throw new AppError('Test topilmadi', 404);
    }

    const totalPasses = await TestPass.countDocuments({ testId: new Types.ObjectId(id) });

    res.json({ success: true, stats: { totalPasses, passCount: test.passCount, viewsCount: test.viewsCount } });
  } catch (err) {
    next(err);
  }
};
