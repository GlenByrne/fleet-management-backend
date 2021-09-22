import { ApolloServer } from 'apollo-server';
import schema from './schema';
import { context } from './context';

const server = new ApolloServer({
  schema,
  context,
});

server.listen().then(() => {
  console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
});

export default server;
