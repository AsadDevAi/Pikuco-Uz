import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  authorId: Types.ObjectId;
  title: string;
  content: string;
  coverImage: string;
  categoryId: Types.ObjectId | null;
  ratingSum: number;
  ratingCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

postSchema.index({ authorId: 1 });
postSchema.index({ categoryId: 1 });
postSchema.index({ ratingSum: -1 });
postSchema.index({ createdAt: -1 });

export default model<IPost>('Post', postSchema);
