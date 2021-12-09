import { queryField, nonNull, idArg, list } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const vehiclesInDepot = queryField('vehiclesInDepot', {
  type: list(Vehicle),
  args: {
    depotId: nonNull(idArg()),
  },
  resolve: (_, { depotId }, context: Context) => {
    try {
      return context.prisma.depot
        .findUnique({
          where: {
            id: depotId,
          },
        })
        .vehicles();
    } catch (error) {
      throw new Error('Error retrieving vehicles for depot');
    }
  },
});
