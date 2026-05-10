import { z } from 'zod';

export const KnowCodeConfigSchema = z.object({
  dbPath: z.string(),
  vectorStorePath: z.string(),
  embedding: z.object({
    provider: z.enum(['xenova', 'ollama', 'openai']).default('xenova'),
    apiKey: z.string().optional(),
    model: z.string().optional(),
  }),
  security: z.object({
    encryptDatabase: z.boolean().default(false),
    sanitizeOnWrite: z.boolean().default(true),
    localOnly: z.boolean().default(true),
  }),
  injection: z.object({
    totalTokens: z.number().default(1500),
    bugPatternsTokens: z.number().default(600),
    adrsTokens: z.number().default(500),
    projectSummaryTokens: z.number().default(300),
    metadataTokens: z.number().default(100),
  }),
  similarity: z.object({
    threshold: z.number().min(0).max(1).default(0.82),
    highThreshold: z.number().min(0).max(1).default(0.92),
    lowThreshold: z.number().min(0).max(1).default(0.70),
  }),
});

export type KnowCodeConfig = z.infer<typeof KnowCodeConfigSchema>;

export function getDefaultConfig(projectRoot?: string): KnowCodeConfig {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '/tmp';
  const basePath = projectRoot 
    ? `${projectRoot}/.knowcode` 
    : `${homeDir}/.knowcode`;

  return {
    dbPath: `${basePath}/knowcode.db`,
    vectorStorePath: `${basePath}/embeddings`,
    embedding: {
      provider: 'xenova',
    },
    security: {
      encryptDatabase: false,
      sanitizeOnWrite: true,
      localOnly: true,
    },
    injection: {
      totalTokens: 1500,
      bugPatternsTokens: 600,
      adrsTokens: 500,
      projectSummaryTokens: 300,
      metadataTokens: 100,
    },
    similarity: {
      threshold: 0.82,
      highThreshold: 0.92,
      lowThreshold: 0.70,
    },
  };
}