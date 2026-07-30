export type TestType = 'quiz' | 'identification' | 'tournament' | 'tree';
export type TestStatus = 'draft' | 'published';
export type TargetType = 'test' | 'post';

export interface User {
  _id: string;
  email?: string;
  username: string;
  avatarUrl: string;
  bio: string;
  points: number;
  monthlyPoints?: number;
  squadId?: string | { _id: string; name: string; avatarUrl: string } | null;
  isVerified?: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

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

export interface Test {
  _id: string;
  authorId: User | string;
  type: TestType;
  title: string;
  description: string;
  coverImage: string;
  categoryId: Category | string | null;
  status: TestStatus;
  content: TestContent;
  ratingSum: number;
  ratingCount: number;
  viewsCount: number;
  passCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  authorId: User | string;
  title: string;
  content: string;
  coverImage: string;
  categoryId: Category | string | null;
  ratingSum: number;
  ratingCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  targetType: TargetType;
  targetId: string;
  userId: User;
  content: string;
  createdAt: string;
}

export interface Rating {
  _id: string;
  targetType: TargetType;
  targetId: string;
  userId: string;
  stars: number;
}

export interface Squad {
  _id: string;
  name: string;
  avatarUrl: string;
  description: string;
  memberIds?: User[];
  leaderId: User | string;
  totalPoints: number;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
