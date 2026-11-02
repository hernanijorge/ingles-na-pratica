import { z } from "zod";

export const vocabularyInput = z.object({ en: z.string().min(1), pt: z.string().min(1) });
export const phraseInput = z.object({ en: z.string().min(1), pt: z.string().min(1) });
export const exerciseInput = z.object({
  type: z.enum(["TRANSLATE", "FILL", "SPEAK"]),
  prompt: z.string().min(1),
  answer: z.string().optional(),
});

export const lessonInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  order: z.number().int().min(1),
  videoUrl: z.string().url().optional().or(z.literal("")),
  isFreePreview: z.boolean().default(false),
  vocabulary: z.array(vocabularyInput).default([]),
  phrases: z.array(phraseInput).default([]),
  exercises: z.array(exerciseInput).default([]),
});

export const courseInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  description: z.string().min(1),
  level: z.string().default("Iniciante"),
  productKey: z.enum(["COURSE_FULL", "COURSE_CONSTRUCTION", "SINGLE_CLASS", "PACKAGE_4"]).optional(),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
});

export type LessonInput = z.infer<typeof lessonInput>;
export type CourseInput = z.infer<typeof courseInput>;
