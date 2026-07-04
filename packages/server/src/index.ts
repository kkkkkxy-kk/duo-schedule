import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRoutes, meRoutes } from './routes/auth.js';
import { todoRoutes } from './routes/todos.js';
import { workspaceRoutes } from './routes/workspace.js';
import { startScheduler } from './jobs/scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);

const app = Fastify({ logger: true });

app.setErrorHandler((error: unknown, _req, reply) => {
  const err = error as { statusCode?: number; message?: string };
  const statusCode = err.statusCode ?? 500;
  reply.status(statusCode).send({
    error: err.message ?? '服务器错误',
  });
});

await app.register(cors, { origin: true });

await authRoutes(app);
await meRoutes(app);
await todoRoutes(app);
await workspaceRoutes(app);

if (process.env.SERVE_STATIC === 'true') {
  const staticPath = path.join(__dirname, '../../web/dist');
  await app.register(fastifyStatic, {
    root: staticPath,
    prefix: '/',
  });
  app.setNotFoundHandler((_req, reply) => {
    reply.sendFile('index.html');
  });
}

startScheduler();

await app.listen({ port, host: '0.0.0.0' });
console.log(`Server running on http://localhost:${port}`);
