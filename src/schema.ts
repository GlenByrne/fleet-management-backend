import { connectionPlugin, makeSchema } from 'nexus';
import { applyMiddleware } from 'graphql-middleware';
import { GraphQLSchema } from 'graphql';
import * as allTypes from './schema/schemaExports';
import { permissions } from './permissions';

const schemaWithoutPermissions = makeSchema({
  types: allTypes,
  plugins: [
    connectionPlugin({
      nonNullDefaults: {
        output: true,
      },
    }),
  ],
  outputs: {
    schema: `${__dirname}/../generated/schema.graphql`,
    typegen: `${__dirname}/../generated/types.ts`,
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
}) as unknown as GraphQLSchema;

const schemaWithPermissions = applyMiddleware(
  schemaWithoutPermissions,
  permissions
);

export default schemaWithPermissions;
