import { Schema, model, Document, Types } from 'mongoose';

export interface ISquad extends Document {
  name: string;
  avatarUrl: string;
  description: string;
  memberIds: Types.ObjectId[];
  leaderId: Types.ObjectId;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const squadSchema = new Schema<ISquad>(
  {
    name: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 50 },
    avatarUrl: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 500 },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true },
);

squadSchema.index({ totalPoints: -1 });

export default model<ISquad>('Squad', squadSchema);
