import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyToken } from './auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: import('./auth.js').JwtPayload;
  }
}

export async function authHook(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: '未登录' });
  }
  try {
    req.user = verifyToken(header.slice(7));
  } catch {
    return reply.status(401).send({ error: 'Token 无效' });
  }
}
