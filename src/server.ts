import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import cookieParser from 'cookie-parser';
import jwt from 'express-jwt';
import cors from 'cors';
import schema from './schema';
import { context } from './context';

const APP_SECRET = 'uoisehofihzoefhos';

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

const startApolloServer = async () => {
  const app = express();
  app.use(cookieParser());
  app.use(cors(corsOptions));

  // app.use(
  //   jwt({
  //     secret: APP_SECRET,
  //     getToken: (req) => req.cookies.token,
  //     algorithms: ['HS256'],
  //   })
  // );

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
    httpServer.listen({ port: 4000 }, resolve)
  );

  console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
};

startApolloServer();

export default APP_SECRET;
