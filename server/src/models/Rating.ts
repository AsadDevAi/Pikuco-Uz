import { Schema, model, Document, Types } from 'mongoose';

export type RatingTargetType = 'test' | 'post';

export interface IRating extends Document {
  targetType: RatingTargetType;
  targetId: Types.ObjectId;
  userId: Types.ObjectId;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    targetType: { type: String, enum: ['test', 'post'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

ratingSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

export default model<IRating>('Rating', ratingSchema);
