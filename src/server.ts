import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import cookie from 'fastify-cookie';
import AltairFastify from 'altair-fastify-plugin';
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  Request,
  sendResult,
  shouldRenderGraphiQL,
} from 'graphql-helix';
import { envelop, useSchema } from '@envelop/core';
import { contextFactory } from 'src/context';
import { schemaWithPermissions } from './schema';

export const ACCESS_TOKEN_SECRET = 'xudvholxjekszefvsuvosuegv';
export const REFRESH_TOKEN_SECRET = 'akjwdhliuawdlUWladuhawud';
export const ACTIVATION_TOKEN_SECRET = 'jnxlkjvelkvlsgvsdkvbsve';
export const RESET_PASSWORD_TOKEN_SECRET = 'lknxoevs;ehnvshleslefh';

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true,
// };

const getEnveloped = envelop({
  plugins: [useSchema(schemaWithPermissions)],
});

const server = fastify();

server.register(cookie);
// server.register(fastifyCors);
server.register(AltairFastify, {
  path: '/altair',
  baseURL: '/altair/',
  endpointURL: '/graphql',
});

server.route({
  method: ['POST', 'GET'],
  url: '/graphql',
  handler: async (req, res) => {
    const { parse, validate, execute, schema } = getEnveloped({
      req,
    });

    const request: Request = {
      headers: req.headers,
      method: req.method,
      query: req.query,
      body: req.body,
    };

    if (shouldRenderGraphiQL(request)) {
      res.type('text/html');
      res.send(
        renderGraphiQL({
          endpoint: '/graphql',
          subscriptionsEndpoint: 'ws://localhost:4000/graphql',
        })
      );
    } else {
      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        contextFactory: () => contextFactory(req, res),
        query,
        variables,
        parse,
        validate,
        execute,
      });

      sendResult(result, res.raw);
    }
  },
});

const port = 4000;

server.listen(port, () => {
  console.log(`
      🚀  Server is running!
      🔉  Listening on port 4000
      📭  Query at http://localhost:4000/graphql
    `);
});
