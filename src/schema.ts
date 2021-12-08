import { DateTimeResolver } from 'graphql-scalars';
import { asNexusMethod, makeSchema } from 'nexus';
import { applyMiddleware } from 'graphql-middleware';
import { GraphQLSchema } from 'graphql';
import * as defectTypes from './schema/Defect';
import * as depotTypes from './schema/Depot';
import * as fuelCardTypes from './schema/FuelCard';
import * as tollTagTypes from './schema/TollTag';
import * as vehicleTypes from './schema/Vehicle';
import * as userTypes from './schema/User';
import * as organisationTypes from './schema/Organisation';
import * as infringementTypes from './schema/Infringement';
import * as usersOnOrganisationsTypes from './schema/UsersOnOrganisations';
import * as enumTypes from './schema/Enum';

import permissions from './permissions';

export const DateTimeScalar = asNexusMethod(DateTimeResolver, 'date');

const schemaWithoutPermissions = makeSchema({
  types: [
    defectTypes,
    depotTypes,
    fuelCardTypes,
    tollTagTypes,
    vehicleTypes,
    userTypes,
    organisationTypes,
    infringementTypes,
    usersOnOrganisationsTypes,
    enumTypes,
    DateTimeScalar,
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

const schema = applyMiddleware(schemaWithoutPermissions, permissions);

export default schema;
