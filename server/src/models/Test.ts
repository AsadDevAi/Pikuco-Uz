import { Schema, model, Document, Types } from 'mongoose';

export type TestType = 'quiz' | 'identification' | 'tournament' | 'tree';
export type TestStatus = 'draft' | 'published';

export interface QuizOption {
  text: string;
  image?: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  text: string;
  image?: string;
  options: QuizOption[];
}

export interface QuizContent {
  type: 'quiz';
  questions: QuizQuestion[];
}

export interface IdentificationResult {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface IdentificationOption {
  text: string;
  weights: Record<string, number>;
}

export interface IdentificationQuestion {
  text: string;
  image?: string;
  options: IdentificationOption[];
}

export interface IdentificationContent {
  type: 'identification';
  results: IdentificationResult[];
  questions: IdentificationQuestion[];
}

export interface TournamentItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export interface TournamentContent {
  type: 'tournament';
  items: TournamentItem[];
}

export interface TreeChoice {
  text: string;
  nextNodeId: string | null;
}

export interface TreeNode {
  id: string;
  text: string;
  image?: string;
  choices: TreeChoice[];
  isEnding: boolean;
}

export interface TreeContent {
  type: 'tree';
  nodes: TreeNode[];
  startNodeId: string;
}

export type TestContent = QuizContent | IdentificationContent | TournamentContent | TreeContent;

export interface ITest extends Document {
  authorId: Types.ObjectId;
  type: TestType;
  title: string;
  description: string;
  coverImage: string;
  categoryId: Types.ObjectId | null;
  status: TestStatus;
  content: TestContent;
  ratingSum: number;
  ratingCount: number;
  viewsCount: number;
  passCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const testSchema = new Schema<ITest>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['quiz', 'identification', 'tournament', 'tree'], required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, default: '', maxlength: 1000 },
    coverImage: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    content: { type: Schema.Types.Mixed, required: true },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    passCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

testSchema.index({ authorId: 1 });
testSchema.index({ categoryId: 1 });
testSchema.index({ status: 1 });
testSchema.index({ ratingSum: -1 });
testSchema.index({ viewsCount: -1 });
testSchema.index({ createdAt: -1 });

export default model<ITest>('Test', testSchema);
