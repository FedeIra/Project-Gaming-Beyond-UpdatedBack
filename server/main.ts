import fastify from 'fastify'
import config from '../pkg/env/config.js';
import { setupErrorHandler } from './errorHandler.js';
import { getVideogamesHandler } from './handlers/getVideogames.js';
import { getVideogameDetailHandler } from './handlers/getVideogameDetail.js';

const server = fastify();

getVideogamesHandler(server);
getVideogameDetailHandler(server);

setupErrorHandler(server);

const port = Number(config.port) || 3000;

try {
  await server.listen({ port });
  console.log(`Listening at http://localhost:${port}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}