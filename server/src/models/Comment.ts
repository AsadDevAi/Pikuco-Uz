import { Schema, model, Document, Types } from 'mongoose';

export type CommentTargetType = 'test' | 'post';

export interface IComment extends Document {
  targetType: CommentTargetType;
  targetId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    targetType: { type: String, enum: ['test', 'post'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: true },
);

commentSchema.index({ targetType: 1, targetId: 1 });
commentSchema.index({ userId: 1 });

export default model<IComment>('Comment', commentSchema);
