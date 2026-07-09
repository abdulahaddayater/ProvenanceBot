import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { saveFeedback } from '../lib/store.js';

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(''),
  walletAddress: z.string().optional(),
});

export async function feedbackRoutes(app: FastifyInstance) {
  app.post('/feedback', async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid feedback', details: parsed.error.flatten() });
    }

    const record = await saveFeedback({
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? '',
      walletAddress: parsed.data.walletAddress ?? null,
    });

    return reply.status(201).send(record);
  });
}
