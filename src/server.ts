import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import cookie from 'fastify-cookie';
import AltairFastify from 'altair-fastify-plugin';
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendMultipartResponseResult,
  sendResponseResult,
  sendResult,
  shouldRenderGraphiQL,
} from 'graphql-helix';
import { envelop, useSchema } from '@envelop/core';
import * as ws from 'ws';
import { contextFactory } from 'src/context';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { GraphQLError, execute, subscribe } from 'graphql';
import { useServer } from 'graphql-ws/lib/use/ws';
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

// const server = fastify();

// server.register(cookie);
// server.register(fastifyCors);
// server.register(AltairFastify, {
//   path: '/altair',
//   baseURL: '/altair/',
//   endpointURL: '/graphql',
// });

// server.route({
//   method: ['POST', 'GET'],
//   url: '/graphql',
//   handler: async (req, res) => {
//     const { parse, validate, execute, schema } = getEnveloped({
//       req,
//     });

//     const request: Request = {
//       headers: req.headers,
//       method: req.method,
//       query: req.query,
//       body: req.body,
//     };

//     if (shouldRenderGraphiQL(request)) {
//       res.type('text/html');
//       res.send(
//         renderGraphiQL({
//           endpoint: '/graphql',
//           subscriptionsEndpoint: 'ws://localhost:4000/graphql',
//         })
//       );
//     } else {
//       const { operationName, query, variables } = getGraphQLParameters(request);

//       const result = await processRequest({
//         request,
//         schema,
//         operationName,
//         contextFactory: () => contextFactory(req, res),
//         query,
//         variables,
//         parse,
//         validate,
//         execute,
//       });

//       sendResult(result, res.raw);
//     }
//   },
// });

const app = express();

app.use(express.json());

app.use(cookieParser());
app.use(cors());

app.use('/graphql', async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  if (shouldRenderGraphiQL(request)) {
    res.send(
      renderGraphiQL({
        subscriptionsEndpoint: 'ws://localhost:4000/graphql',
      })
    );

    return;
  }

  const { operationName, query, variables } = getGraphQLParameters(request);

  const result = await processRequest({
    operationName,
    query,
    variables,
    request,
    schema: schemaWithPermissions,
    contextFactory: () => contextFactory(req, res),
  });

  if (result.type === 'RESPONSE') {
    sendResponseResult(result, res);
  } else if (result.type === 'MULTIPART_RESPONSE') {
    sendMultipartResponseResult(result, res);
  } else {
    res.status(422);
    res.json({
      errors: [
        new GraphQLError('Subscriptions should be sent over WebSocket.'),
      ],
    });
  }
});

const port = 4000;

const server = app.listen(port, () => {
  const wsServer = new ws.Server({
    server,
    path: '/graphql',
  });

  useServer({ schema: schemaWithPermissions, execute, subscribe }, wsServer);

  console.log(`
      🚀  Server is running!
      🔉  Listening on port 4000
      📭  Query at http://localhost:4000/graphql
    `);
});
