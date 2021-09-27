import { DateTimeResolver } from 'graphql-scalars';
import { asNexusMethod, makeSchema } from 'nexus';
import * as defectTypes from './schema/Defect';
import * as depotTypes from './schema/Depot';
import * as fuelCardTypes from './schema/FuelCard';
import * as tollTagTypes from './schema/TollTag';
import * as vehicleTypes from './schema/Vehicle';

export const DateTimeScalar = asNexusMethod(DateTimeResolver, 'date');

const schema = makeSchema({
  types: [
    defectTypes,
    depotTypes,
    fuelCardTypes,
    tollTagTypes,
    vehicleTypes,
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
});

export default schema;
