import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
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
  const app = express();
  app.use(cookieParser());
  app.use(cors());

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema,
    context,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: '/',
    cors: false,
  });

  await new Promise<void>((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    httpServer.listen({ port: 4000 }, resolve)
  );

  console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
};

startApolloServer();
