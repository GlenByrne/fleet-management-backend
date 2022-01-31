import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyCookie from 'fastify-cookie';
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  Request,
  sendResult,
  shouldRenderGraphiQL,
} from 'graphql-helix';
import { envelop, useSchema } from '@envelop/core';
import { schema } from './schema';
import { contextFactory } from './context';

export const ACCESS_TOKEN_SECRET = 'xudvholxjekszefvsuvosuegv';
export const REFRESH_TOKEN_SECRET = 'akjwdhliuawdlUWladuhawud';
export const ACTIVATION_TOKEN_SECRET = 'jnxlkjvelkvlsgvsdkvbsve';
export const RESET_PASSWORD_TOKEN_SECRET = 'lknxoevs;ehnvshleslefh';

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true,
// };

async function createServer() {
  const getEnveloped = envelop({
    plugins: [useSchema(schema)],
  });

  const server = fastify();

  server.register(fastifyCookie);
  server.register(fastifyCors);

  server.route({
    method: ['POST', 'GET'],
    url: '/graphql',
    handler: async (req, reply) => {
      const request: Request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.body,
      };

      if (shouldRenderGraphiQL(request)) {
        reply.header('Content-Type', 'text/html');
        reply.send(
          renderGraphiQL({
            endpoint: '/graphql',
          })
        );

        return;
      }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        contextFactory: () => contextFactory(req, reply),
        query,
        variables,
      });

      sendResult(result, reply.raw);
    },
  });

  return server;
}

export const startServer = async () => {
  const server = await createServer();

  const port = 4000;
  await server.listen(port, () => {
    console.log(`
      🚀  Server is running!
      🔉  Listening on port 4000
      📭  Query at http://localhost:4000/graphql
    `);
  });
};
