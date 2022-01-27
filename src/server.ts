import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fastify from 'fastify';
import mercurius from 'mercurius';
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  Request,
  sendResult,
  shouldRenderGraphiQL,
} from 'graphql-helix';
import { schema } from './schema';
import { context } from './context';

export const ACCESS_TOKEN_SECRET = 'xudvholxjekszefvsuvosuegv';
export const REFRESH_TOKEN_SECRET = 'akjwdhliuawdlUWladuhawud';
export const ACTIVATION_TOKEN_SECRET = 'jnxlkjvelkvlsgvsdkvbsve';
export const RESET_PASSWORD_TOKEN_SECRET = 'lknxoevs;ehnvshleslefh';

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true,
// };

const startApolloServer = async () => {
  // const app = express();
  // app.use(cookieParser());
  // app.use(cors());

  // const httpServer = http.createServer(app);

  // const server = new ApolloServer({
  //   schema,
  //   context,
  //   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  // });

  // await server.start();

  // server.applyMiddleware({
  //   app,
  //   path: '/',
  //   cors: false,
  // });

  // await new Promise<void>((resolve) =>
  //   // eslint-disable-next-line no-promise-executor-return
  //   httpServer.listen({ port: 4000 }, resolve)
  // );

  const app = fastify();

  app.route({
    method: ['POST', 'GET'],
    url: '/',
    handler: async (req, res) => {
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
            endpoint: '/',
          })
        );

        return;
      }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        // contextFactory: context,
        query,
        variables,
      });

      sendResult(result, res.raw);

      res.sent = true;
    },
  });

  app.register(mercurius, {
    schema,
    jit: 1,
  });

  app.listen(4000, () => {
    console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
  });
};

startApolloServer();
