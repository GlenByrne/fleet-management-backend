import { makeSchema, objectType, queryType } from 'nexus';
import { Context } from './context';

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.id('id');
    t.string('title');
    t.string('body');
  },
});

const Query = queryType({
  definition(t) {
    t.list.field('posts', {
      type: 'Post',
      resolve: (_, __, context: Context) => context.prisma.post.findMany(),
    });
  },
});

const schema = makeSchema({
  types: [Post, Query],
  outputs: {
    schema: `${__dirname}/generated/schema.graphql`,
    typegen: `${__dirname}/generated/types.ts`,
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
});

export default schema;
