import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.string().default('info'),

  SOROBAN_RPC_URL: z.string().url().default('https://soroban-testnet.stellar.org'),
  STELLAR_NETWORK_PASSPHRASE: z.string().default('Test SDF Network ; September 2015'),
  PROVENANCE_CONTRACT_ID: z.string().optional().default(''),
  STELLAR_SECRET_KEY: z.string().optional().default(''),

  RETRIEVER_MAX_SOURCES: z.coerce.number().default(8),
  SYNTHESIZER_MODEL: z.string().optional().default(''),
  NOTARY_BATCH_SIZE: z.coerce.number().default(16),

  SENTRY_DSN: z.string().optional().default(''),
  ANALYTICS_WRITE_KEY: z.string().optional().default(''),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
