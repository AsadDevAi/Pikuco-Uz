import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl: string;
  bio: string;
  points: number;
  monthlyPoints: number;
  squadId: Types.ObjectId | null;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiry: Date | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    passwordHash: { type: String, required: false },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    points: { type: Number, default: 0 },
    monthlyPoints: { type: Number, default: 0 },
    squadId: { type: Schema.Types.ObjectId, ref: 'Squad', default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpiry: { type: Date, default: null },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.index({ points: -1 });
userSchema.index({ monthlyPoints: -1 });

export default model<IUser>('User', userSchema);
