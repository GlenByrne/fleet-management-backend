import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-lambda';
import schema from './schema';
import { context } from './context';

export const ACCESS_TOKEN_SECRET = 'xudvholxjekszefvsuvosuegv';
export const REFRESH_TOKEN_SECRET = 'akjwdhliuawdlUWladuhawud';

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true,
// };

// const app = express();
// app.use(cookieParser());
// app.use(cors());

// const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema,
  context,
  // plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// server.applyMiddleware({
//   app,
//   path: '/',
//   cors: false,
// });

// await new Promise<void>((resolve) =>
//   httpServer.listen({ port: 4000 }, resolve)
// );

exports.graphqlHandler = server.createHandler({
  expressAppFromMiddleware() {
    const app = express();
    app.use(cookieParser());
    app.use(cors());
    return app;
  },
});

console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
