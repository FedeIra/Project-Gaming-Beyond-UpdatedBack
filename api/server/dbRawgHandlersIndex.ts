import { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

import { getVideogamesHandler } from './dbRawgHandlers/getVideogames.js';
import { getVideogamesByNameHandler } from './dbRawgHandlers/getVideogamesByName.js';
import { getVideogameDetailHandler } from './dbRawgHandlers/getVideogameDetail.js';

export const videogamesRawgDbHandlers = (
  server: FastifyInstance<Server, IncomingMessage, ServerResponse>
) => {
  getVideogamesHandler(server);
  getVideogamesByNameHandler(server);
  getVideogameDetailHandler(server);
};
