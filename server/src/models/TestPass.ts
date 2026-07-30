import { Schema, model, Document, Types } from 'mongoose';

export interface ITestPass extends Document {
  testId: Types.ObjectId;
  userId: Types.ObjectId | null;
  resultData: Record<string, unknown>;
  createdAt: Date;
}

const testPassSchema = new Schema<ITestPass>(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resultData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

testPassSchema.index({ testId: 1 });
testPassSchema.index({ userId: 1 });
testPassSchema.index({ testId: 1, userId: 1 });

export default model<ITestPass>('TestPass', testPassSchema);
