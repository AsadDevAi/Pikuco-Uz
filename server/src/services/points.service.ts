import User from '../models/User';
import Squad from '../models/Squad';
import { Types } from 'mongoose';

const POINTS = {
  CREATE_TEST: 15,
  CREATE_POST: 10,
  COMPLETE_TEST: 2,
  RECEIVE_5_STAR: 3,
} as const;

export const awardPoints = async (
  userId: string,
  action: keyof typeof POINTS,
): Promise<void> => {
  const amount = POINTS[action];
  const user = await User.findByIdAndUpdate(
    new Types.ObjectId(userId),
    { $inc: { points: amount, monthlyPoints: amount } },
    { new: true },
  );

  if (user?.squadId) {
    await Squad.findByIdAndUpdate(user.squadId, {
      $inc: { totalPoints: amount },
    });
  }
};

export const resetMonthlyPoints = async (): Promise<void> => {
  await User.updateMany({}, { $set: { monthlyPoints: 0 } });
};
