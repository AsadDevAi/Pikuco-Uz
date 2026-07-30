import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Noto\'g\'ri email format'),
  username: z
    .string()
    .min(3, 'Foydalanuvchi nomi kamida 3 ta belgi bo\'lishi kerak')
    .max(30, 'Foydalanuvchi nomi 30 ta belgidan oshmasligi kerak')
    .regex(/^[a-zA-Z0-9_]+$/, 'Faqat harflar, raqamlar va _ belgisi ishlatilishi mumkin'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
  fullName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Noto\'g\'ri email format'),
  password: z.string().min(1, 'Parolni kiriting'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Noto\'g\'ri email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token talab qilinadi'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi bo\'lishi kerak'),
});

const quizOptionSchema = z.object({
  text: z.string().min(1),
  image: z.string().optional(),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z.object({
  text: z.string().min(1),
  image: z.string().optional(),
  options: z.array(quizOptionSchema).min(2, 'Kamida 2 ta variant kerak'),
});

const quizContentSchema = z.object({
  type: z.literal('quiz'),
  questions: z.array(quizQuestionSchema).min(1, 'Kamida 1 ta savol kerak'),
});

const identificationResultSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  image: z.string().optional(),
});

const identificationOptionSchema = z.object({
  text: z.string().min(1),
  weights: z.record(z.string(), z.number()),
});

const identificationQuestionSchema = z.object({
  text: z.string().min(1),
  image: z.string().optional(),
  options: z.array(identificationOptionSchema).min(2),
});

const identificationContentSchema = z.object({
  type: z.literal('identification'),
  results: z.array(identificationResultSchema).min(2, 'Kamida 2 ta natija kerak'),
  questions: z.array(identificationQuestionSchema).min(1),
});

const tournamentItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video']),
});

const tournamentContentSchema = z.object({
  type: z.literal('tournament'),
  items: z.array(tournamentItemSchema).min(4, 'Kamida 4 ta element kerak'),
});

const treeChoiceSchema = z.object({
  text: z.string().min(1),
  nextNodeId: z.string().nullable(),
});

const treeNodeSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  image: z.string().optional(),
  choices: z.array(treeChoiceSchema),
  isEnding: z.boolean(),
});

const treeContentSchema = z.object({
  type: z.literal('tree'),
  nodes: z.array(treeNodeSchema).min(1, 'Kamida 1 ta tugun kerak'),
  startNodeId: z.string().min(1),
});

const testContentSchema = z.discriminatedUnion('type', [
  quizContentSchema,
  identificationContentSchema,
  tournamentContentSchema,
  treeContentSchema,
]);

export const createTestSchema = z.object({
  type: z.enum(['quiz', 'identification', 'tournament', 'tree']),
  title: z.string().min(3, 'Sarlavha kamida 3 ta belgi bo\'lishi kerak').max(150),
  description: z.string().max(1000).optional().default(''),
  coverImage: z.string().optional().default(''),
  categoryId: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  content: testContentSchema,
});

export const createPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  coverImage: z.string().optional().default(''),
  categoryId: z.string().nullable().optional(),
});

export const createCommentSchema = z.object({
  targetType: z.enum(['test', 'post']),
  targetId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const createRatingSchema = z.object({
  targetType: z.enum(['test', 'post']),
  targetId: z.string().min(1),
  stars: z.number().int().min(1).max(5),
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

export const createSquadSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional().default(''),
});
